import connectDB from '@/app/lib/mongodb';
import Property from '@/app/models/Property';
import User from '@/app/models/User';
import PropertyCard from '@/app/components/ui/PropertyCard';
import PropertyFilters from '@/app/components/properties/PropertyFilters';

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

export default async function PropertiesPage({ searchParams }) {
  const { properties, pagination } = await getProperties(searchParams);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">נכסים למכירה ולהשכרה</h1>
          <p className="mt-4 text-xl text-gray-600">
            מצא את הנכס המושלם עבורך מתוך {pagination.totalItems} נכסים
          </p>
        </div>

        {/* Filters */}
        <PropertyFilters />

        {/* Properties Grid */}
        {properties.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900">לא נמצאו נכסים</h3>
            <p className="mt-2 text-gray-600">נסה לשנות את מסנני החיפוש שלך</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isCurrentPage = pageNum === pagination.currentPage;
                // Create new URLSearchParams with current search params
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('page', pageNum.toString());
                
                return (
                  <a
                    key={pageNum}
                    href={`/properties?${newSearchParams.toString()}`}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                      ${isCurrentPage 
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </a>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
} 