import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Property from '../../../../models/Property';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    await connectDB();
    
    const property = await Property.findById(id).lean();
    
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Get the first image or video for sharing
    const imageUrl = property.video?.secure_url || (property.images && property.images[0]?.secure_url);
    
    // Create description
    const description = property.descriptions?.hebrew || property.descriptions?.arabic || 
      `נכס ${property.status === 'For Sale' ? 'למכירה' : 'להשכרה'} ב${property.location} - ${property.bedrooms} חדרים, ${property.area} מ"ר`;

    const shareData = {
      title: `${property.title} - ${property.location}`,
      description: description,
      price: property.price,
      currency: 'ILS',
      location: property.location,
      bedrooms: property.bedrooms,
      area: property.area,
      status: property.status,
      imageUrl: imageUrl,
      propertyUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/properties/${id}`,
      openGraph: {
        title: `${property.title} - ${property.location}`,
        description: description,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/properties/${id}`,
        siteName: 'RealEstate Platform',
        images: imageUrl ? [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: property.title,
          }
        ] : [],
        locale: 'he_IL',
        type: 'website',
      }
    };

    return NextResponse.json(shareData);
  } catch (error) {
    console.error('Error fetching property for sharing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 