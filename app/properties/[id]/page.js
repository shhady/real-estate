import Image from 'next/image';
import Link from 'next/link';
import { FaBed, FaBath, FaRuler, FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaUserTie, FaCalendar } from 'react-icons/fa';
import { notFound } from 'next/navigation';
import connectDB from '@/app/lib/mongodb';
import Property from '@/app/models/Property';
import User from '@/app/models/User';
import ImageCarousel from '@/app/components/ui/ImageCarousel';

// Format price consistently
const formatPrice = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default async function PropertyPage({ params }) {
  const { id } = await params;

  try {
    await connectDB();
    
    // Fetch property with agent details
    const property = await Property.findById(id)
      .populate({
        path: 'user',
        model: User,
        select: 'fullName email phone whatsapp bio profileImage calendlyLink'
      })
      .lean();

    if (!property) {
      notFound();
    }

    // Convert _id to string
    property._id = property._id.toString();
    property.user._id = property.user._id.toString();
    
    // Serialize images
    property.images = property.images.map(img => ({
      secure_url: img.secure_url,
      publicId: img.publicId,
      _id: img._id ? img._id.toString() : undefined
    }));

    // Serialize user's profileImage if it exists
    if (property.user.profileImage) {
      property.user.profileImage = {
        secure_url: property.user.profileImage.secure_url,
        publicId: property.user.profileImage.publicId,
        _id: property.user.profileImage._id ? property.user.profileImage._id.toString() : undefined
      };
    }

    return (
      <div className="min-h-screen bg-white py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Property Images Carousel */}
          <div className="mb-6 md:mb-8">
          {property.images && property.images.length > 0 && <ImageCarousel images={property.images} />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {/* Property Details */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="ml-2 text-blue-600" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ₪{formatPrice(property.price)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 py-6 border-y border-gray-200 mb-6">
                  <div className="flex flex-col items-center">
                    <FaBed className="h-6 w-6 text-blue-600 mb-2" />
                    <span className="text-lg text-black font-semibold">{property.bedrooms}</span>
                    <span className="text-sm text-gray-600">חדרים</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FaBath className="h-6 w-6 text-blue-600 mb-2" />
                    <span className="text-lg text-black font-semibold">{property.bathrooms}</span>
                    <span className="text-sm text-gray-600">חדרי רחצה</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FaRuler className="h-6 w-6 text-blue-600 mb-2" />
                    <span className="text-lg text-black font-semibold">{property.area}</span>
                    <span className="text-sm text-gray-600">מ"ר</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">תיאור הנכס</h2>
                  <div 
                    className="text-gray-600"
                    dangerouslySetInnerHTML={{ 
                      __html: property.description.startsWith('<') ? 
                        property.description : 
                        `<p>${property.description}</p>` 
                    }}
                  />
                  {/* <p className="text-gray-600 whitespace-pre-line">{property.description}</p> */}
                </div>

                {property.features && property.features.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">מאפיינים</h2>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {property.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <span className="ml-2 text-blue-600">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Agent Contact Card */}
            <div className="bg-white rounded-lg shadow-md p-6 h-fit">
              <div className="text-center mb-6">
                <div className="relative h-24 w-24 mx-auto mb-4">
                  <Image
                    src={property.user.profileImage?.secure_url || '/placeholder-agent.jpg'}
                    alt={property.user.fullName}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                {(property.user.socialMedia?.facebook || property.user.socialMedia?.instagram) && (
                  <div className="flex items-center justify-center space-x-4 mt-2">
                    {property.user.socialMedia.facebook && (
                      <a 
                        href={property.user.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <FaFacebook className="w-5 h-5" />
                      </a>
                    )}
                    {property.user.socialMedia.instagram && (
                      <a
                        href={property.user.socialMedia.instagram}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        <FaInstagram className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
                <h2 className="text-xl font-semibold text-black">{property.user.fullName}</h2>
                <div className="flex items-center justify-center text-blue-600 mt-2">
                  <FaUserTie className="ml-2" />
                  <span className="text-sm">סוכן נדל"ן מוסמך</span>
                </div>
               
              </div>

              <div className="space-y-4">
                {property.user.phone && (
                  <a
                    href={`tel:${property.user.phone}`}
                    className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaPhone className="ml-2" />
                    התקשר עכשיו
                  </a>
                )}
                {property.user.whatsapp && (
                  <a
                    href={`https://wa.me/${property.user.whatsapp}?text=היי, אני מתעניין בנכס: ${property.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaWhatsapp className="ml-2" />
                    וואטסאפ
                  </a>
                )}
                  {property.user.calendlyLink && (
                        <a
                          href={`${property.user.calendlyLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          // onClick={() => handleContactClick('email')}
                          className="bg-gray-400 flex items-center justify-center w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <FaCalendar className="ml-2" />
                          <span>קבע פגישה</span>
                        </a>
                      )}
                {property.user.email && (
                  <a
                    href={`mailto:${property.user.email}?subject=התעניינות בנכס: ${property.title}`}
                    className="flex items-center justify-center w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaEnvelope className="ml-2" />
                    שלח אימייל
                  </a>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">אודות הסוכן</h3>
                <p className="text-gray-600 text-sm">{property.user.bio}</p>
                <Link
                  href={`/agents/${property.user._id}`}
                  className="inline-block mt-4 text-blue-600 hover:text-blue-800"
                >
                  צפה בפרופיל המלא
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
} 