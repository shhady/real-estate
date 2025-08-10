import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Property from '../../models/Property';
import { getUser } from '../../lib/auth';
import User from '../../models/User';

// Webhook URLs
const PRIMARY_WEBHOOK = 'https://primary-production-2eb6.up.railway.app/webhook-test/a4827f61-edf7-41ce-9e2d-32c76fc96233';
const FALLBACK_WEBHOOK = 'https://primary-production-2eb6.up.railway.app/webhook/a4827f61-edf7-41ce-9e2d-32c76fc96233';

// Function to send property data to webhooks with fallback
async function sendToWebhooks(propertyData) {
  const webhookPayload = {
    event: 'property.created',
    timestamp: new Date().toISOString(),
    data: propertyData
  };

  try {
    // Try primary webhook first
    console.log('Sending to primary webhook:', PRIMARY_WEBHOOK);
    const primaryResponse = await fetch(PRIMARY_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (primaryResponse.ok) {
      console.log('Primary webhook sent successfully');
      return;
    } else {
      console.error('Primary webhook failed with status:', primaryResponse.status);
      throw new Error(`Primary webhook failed: ${primaryResponse.status}`);
    }
  } catch (primaryError) {
    console.error('Primary webhook error:', primaryError);
    
    // Try fallback webhook
    try {
      console.log('Sending to fallback webhook:', FALLBACK_WEBHOOK);
      const fallbackResponse = await fetch(FALLBACK_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (fallbackResponse.ok) {
        console.log('Fallback webhook sent successfully');
        return;
      } else {
        console.error('Fallback webhook failed with status:', fallbackResponse.status);
        throw new Error(`Both webhooks failed. Fallback status: ${fallbackResponse.status}`);
      }
    } catch (fallbackError) {
      console.error('Fallback webhook error:', fallbackError);
      throw new Error(`Both webhooks failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`);
    }
  }
}

// GET all properties
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 8;
    const location = searchParams.get('location');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');

    await connectDB();

    const query = {};
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.propertyType = { $regex: `^${type}$`, $options: 'i' };
    if (status) query.status = status;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    if (bedrooms) query.bedrooms = parseInt(bedrooms);
    
    const skip = (page - 1) * limit;
    const properties = await Property.find(query)
      .populate('user', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Property.countDocuments(query);

    return NextResponse.json({
      properties,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/properties:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST new property
export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    console.log('Creating property with data:', data);

    // Fetch user details to get agency name if not provided
    const userDetails = await User.findById(user.userId).select('agencyName fullName').lean();
    if (!userDetails) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle data from upload wizard format
    const listing = data.listing || data;
    const mediaUrls = Array.isArray(data.mediaUrls) ? data.mediaUrls : [data.mediaUrls].filter(Boolean);
    
    // Determine content type based on media
    let contentType = 'single-image';
    let images = [];
    let video = null;
    
    if (data.selectedContentType) {
      contentType = data.selectedContentType;
    } else if (mediaUrls.length > 1) {
      contentType = 'carousel';
    } else if (mediaUrls.length === 1) {
      // Check if it's a video URL (simple heuristic)
      const url = mediaUrls[0];
      if (url.includes('.mp4') || url.includes('video') || url.includes('json2video')) {
        contentType = 'video';
      }
    }

    // Process media based on content type
    if (contentType === 'video' || contentType === 'video-from-images') {
      if (data.videoUrl) {
        video = {
          secure_url: data.videoUrl,
          publicId: data.videoPublicId || '',
          type: contentType === 'video-from-images' ? 'generated' : 'uploaded'
        };
      } else if (mediaUrls.length > 0) {
        video = {
          secure_url: mediaUrls[0],
          publicId: '',
          type: 'uploaded'
        };
      }

      // For video-from-images, also save the source images
      if (contentType === 'video-from-images' && data.uploadedMedia) {
        images = data.uploadedMedia
          .filter(item => item.mediaType === 'image')
          .map(item => ({
            secure_url: item.url,
            publicId: item.publicId || ''
          }));
      }
    } else {
      // Handle images (single or carousel)
      if (data.images && Array.isArray(data.images)) {
        // Standard property creation format
    const validImages = data.images.every(img => img.secure_url && img.publicId);
    if (!validImages) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }
        images = data.images.map(img => ({
          secure_url: img.secure_url,
          publicId: img.publicId
        }));
      } else if (mediaUrls.length > 0) {
        // Upload wizard format
        images = mediaUrls.map((url, index) => ({
          secure_url: url,
          publicId: data.uploadedMedia?.[index]?.publicId || ''
        }));
      }
    }

    // Handle descriptions
    let descriptions = { hebrew: '', arabic: '' };
    if (data.description && typeof data.description === 'object') {
      descriptions = {
        hebrew: data.description.hebrew || '',
        arabic: data.description.arabic || ''
      };
    } else if (data.descriptionHE || data.descriptionAR) {
      descriptions = {
        hebrew: data.descriptionHE || '',
        arabic: data.descriptionAR || ''
      };
    } else if (data.descriptions) {
      descriptions = data.descriptions;
    }

    // Map form fields to property fields
    const propertyData = {
      title: listing.title || data.title || '',
      description: data.description || '', // Keep for backward compatibility
      descriptions: descriptions,
      price: parseFloat(listing.price || data.price || 0),
      location: listing.location || data.location || '',
      address: {
        street: listing.address?.street || data.address?.street || '',
        number: listing.address?.number || data.address?.number || '',
        neighborhood: listing.address?.neighborhood || data.address?.neighborhood || ''
      },
      country: listing.country || data.country || 'ישראל',
      propertyType: listing.type || data.propertyType || 'apartment',
      status: listing.status || data.status || 'For Sale',
      bedrooms: parseInt(listing.rooms || data.bedrooms || 0),
      bathrooms: listing.bathrooms || data.bathrooms ? parseInt(listing.bathrooms || data.bathrooms) : undefined,
      area: parseFloat(listing.area || data.area || 0),
      floor: listing.floor || data.floor || '',
      notes: listing.notes || data.notes || '',
      agencyName: listing.agencyName || data.agencyName || userDetails.agencyName || '',
      contentType: contentType,
      images: images,
      mediaUrls: mediaUrls,
      features: data.features || [],
      user: user.userId,
      languageChoice: data.languageChoice || 'both',
      externalListingId: data.listingId || null,
      listingUrl: data.listingUrl || null,
      collaboration: Boolean(data.collaboration) || false
    };

    // Only add video field if it's properly formed
    if (video && video.secure_url && typeof video.secure_url === 'string') {
      propertyData.video = video;
    }

    // Remove undefined values
    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] === undefined) {
        delete propertyData[key];
      }
    });

    console.log('Creating property with processed data:', propertyData);

    const property = await Property.create(propertyData);

    // Add property to user's properties array
    await User.findByIdAndUpdate(
      user.userId,
      { $push: { properties: property._id } }
    );

    // Populate agent data in response
    const populatedProperty = await Property.findById(property._id)
      .populate('user', 'fullName email phone whatsapp bio profileImage')
      .lean();

    // Send property data to webhooks (primary with fallback)
    try {
      await sendToWebhooks(populatedProperty);
    } catch (error) {
      console.error('Webhook notification failed:', error);
      // Continue with property creation even if webhook fails
    }

    return NextResponse.json({
      success: true,
      property: populatedProperty,
      message: 'Property created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 