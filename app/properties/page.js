import { Suspense } from 'react';
import connectDB from '@/app/lib/mongodb';
import Property from '@/app/models/Property';
import User from '@/app/models/User';
import PropertyCard from '@/app/components/ui/PropertyCard';
import PropertyFilters from '@/app/components/properties/PropertyFilters';
import PropertyList from '@/app/components/properties/PropertyList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'נכסים למכירה ולהשכרה | Real Estate',
  description: 'עיין במגוון הנכסים שלנו למכירה ולהשכרה. מצא את הנכס המושלם עבורך עם מערכת החיפוש המתקדמת שלנו.',
};

const ITEMS_PER_PAGE = 12;

async function getProperties(searchParams) {
  try {
    await connectDB();

    // Await searchParams
    const params = await searchParams;

    // Build filter query
    const query = { approved: true };
    
    if (params.location) {
      query.location = { $regex: params.location, $options: 'i' };
    }
    
    if (params.type) {
      query.propertyType = params.type;
    }
    
    if (params.status) {
      query.status = params.status;
    }
    
    if (params.minPrice || params.maxPrice) {
      query.price = {};
      if (params.minPrice) query.price.$gte = Number(params.minPrice);
      if (params.maxPrice) query.price.$lte = Number(params.maxPrice);
    }
    
    if (params.bedrooms) {
      query.bedrooms = Number(params.bedrooms);
    }

    // Calculate pagination
    const page = Number(params.page) || 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Get total count for pagination
    const totalCount = await Property.countDocuments(query);
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Fetch properties with pagination
    const properties = await Property.find(query)
      .populate({
        path: 'user',
        model: User,
        select: 'fullName email phone'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .lean();

    // Convert _id to string and sanitize data
    const sanitizedProperties = properties.map(property => ({
      ...property,
      _id: property._id.toString(),
      images: property.images.map(img => ({
        secure_url: img.secure_url,
        publicId: img.publicId,
        _id: img._id ? img._id.toString() : undefined
      })),
      user: {
        ...property.user,
        _id: property.user._id.toString()
      }
    }));

    return {
      properties: sanitizedProperties,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount
      }
    };
  } catch (error) {
    console.error('Error fetching properties:', error);
    return {
      properties: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0
      }
    };
  }
}

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">נכסים למכירה ולהשכרה</h1>
          <p className="mt-4 text-xl text-gray-600">
            מצא את הנכס המושלם עבורך
          </p>
        </div>

        <Suspense fallback={<div>טוען פילטרים...</div>}>
          <PropertyFilters />
        </Suspense>

        <Suspense fallback={<div className="text-center py-8">טוען נכסים...</div>}>
          <PropertyList />
        </Suspense>
      </div>
    </div>
  );
} 