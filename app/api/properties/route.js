import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Property from '../../models/Property';
import { getUser } from '../../lib/auth';
import User from '../../models/User';

// GET all properties
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 9;
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
    
    // Validate image data
    if (!data.images || !Array.isArray(data.images)) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    }

    // Ensure each image has both secure_url and publicId
    const validImages = data.images.every(img => img.secure_url && img.publicId);
    if (!validImages) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    // Create property with cleaned image data
    const propertyData = {
      ...data,
      user: user.userId,
      images: data.images.map(img => ({
        secure_url: img.secure_url,
        publicId: img.publicId
      }))
    };

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

    return NextResponse.json(populatedProperty, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 