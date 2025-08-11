import Image from 'next/image';
import Link from 'next/link';
import { FaBed, FaBath, FaRuler, FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaUserTie, FaCalendar, FaBuilding, FaHome, FaVideo, FaImages, FaLanguage, FaFacebook, FaInstagram, FaStickyNote, FaClock, FaParking, FaShieldAlt, FaAccessibleIcon } from 'react-icons/fa';
import { notFound } from 'next/navigation';
import connectDB from '../../lib/mongodb';
import Property from '../../models/Property';
import User from '../../models/User';
import ImageCarousel from '../../components/ui/ImageCarousel';
import { DealScoreBadgeLarge } from '../../components/ui/DealScoreBadge';
import { TbElevator,TbAirConditioning  } from "react-icons/tb";
import { MdBalcony } from "react-icons/md";

// Format price consistently
const formatPrice = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Translate property type to Hebrew (including land subtypes)
const translatePropertyType = (type) => {
  const translations = {
    apartment: 'דירה',
    house: 'בית פרטי',
    villa: 'וילה',
    condo: 'דירת גן',
    land: 'מגרש / קרקע',
    agriculturalLand: 'קרקע חקלאית',
    residentialLand: 'קרקע לבנייה (מגורים)',
    industrialLand: 'קרקע תעשייה',
    commercialLand: 'קרקע מסחרית',
    commercial: 'מסחרי',
    office: 'משרד',
    warehouse: 'מחסן',
    cottage: "קוטג'",
    duplex: 'דופלקס',
    other: 'אחר',
  };
  return translations[type] || type;
};

// Helper: determine if type is land-category
const isLandType = (type) => ['land','agriculturalLand','residentialLand','industrialLand','commercialLand'].includes(type);

// Format date in Hebrew
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const { id } = await params;
  
  try {
    await connectDB();
    const property = await Property.findById(id).select('title location price images video descriptions status bedrooms area propertyType').lean();
    
    if (!property) {
      return { title: 'נכס לא נמצא' };
    }

    // Get the first image for Open Graph
    const imageUrl = property.video?.secure_url || (property.images && property.images[0]?.secure_url);
    
    // Create description
    const description = property.descriptions?.hebrew || property.descriptions?.arabic || 
      `נכס ${property.status === 'For Sale' ? 'למכירה' : 'להשכרה'} ב${property.location} - ${property.bedrooms} חדרים, ${property.area} מ"ר`;

    return {
      title: `${property.title} - ${property.location} | ₪${formatPrice(property.price)}`,
      description: description,
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
      },
      twitter: {
        card: 'summary_large_image',
        title: `${property.title} - ${property.location}`,
        description: description,
        images: imageUrl ? [imageUrl] : [],
      },
      other: {
        'og:price:amount': property.price.toString(),
        'og:price:currency': 'ILS',
        'og:type': 'product',
        'product:price:amount': property.price.toString(),
        'product:price:currency': 'ILS',
      }
    };
  } catch (error) {
    return { title: 'נכס' };
  }
}

export default async function PropertyPage({ params }) {
  const { id } = await params;

  try {
    await connectDB();
    
    // Fetch property with agent details
    const property = await Property.findById(id)
      .populate({
        path: 'user',
        model: User,
        select: 'fullName email phone whatsapp bio profileImage calendlyLink agencyName socialMedia slug'
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

    // Serialize video if it exists
    if (property.video) {
      property.video = {
        secure_url: property.video.secure_url,
        publicId: property.video.publicId,
        type: property.video.type
      };
    }

    // Serialize user's profileImage if it exists
    if (property.user.profileImage) {
      property.user.profileImage = {
        secure_url: property.user.profileImage.secure_url,
        publicId: property.user.profileImage.publicId,
        _id: property.user.profileImage._id ? property.user.profileImage._id.toString() : undefined
      };
    }

    // Convert dates to strings
    if (property.createdAt) property.createdAt = property.createdAt.toString();
    if (property.updatedAt) property.updatedAt = property.updatedAt.toString();

    return (
      <div className="min-h-screen bg-white py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Property Media */}
          <div className="mb-6 md:mb-8">
            {/* Content Type Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                property.contentType === 'video' || property.contentType === 'video-from-images'
                  ? 'bg-purple-100 text-purple-800'
                  : property.contentType === 'carousel'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
              }`}>
                {property.contentType === 'video' || property.contentType === 'video-from-images' ? (
                  <><FaVideo className="ml-1" /> סרטון</>
                ) : property.contentType === 'carousel' ? (
                  <><FaImages className="ml-1" /> גלריה ({property.images?.length || 0} תמונות)</>
                ) : (
                  <><FaHome className="ml-1" /> תמונה יחידה</>
                )}
              </span>
              
              {property.languageChoice && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <FaLanguage className="ml-1" />
                  {property.languageChoice === 'both' ? 'עברית + ערבית' : 
                   property.languageChoice === 'hebrew' ? 'עברית' : 'ערבית'}
                </span>
              )}
            </div>

            {/* Video Display */}
            {property.video && (property.contentType === 'video' || property.contentType === 'video-from-images') && (
              <div className="mb-4">
                <video 
                   autoPlay
                   muted
                  controls 
                  playsInline
                  className="w-full rounded-lg shadow-lg"
                  style={{ maxHeight: '500px' }}
                >
                  <source src={property.video.secure_url} type="video/mp4" />
                  הדפדפן שלך לא תומך בתגית וידאו.
                </video>
                <p className="text-xs text-gray-500 mt-2">
                  סוג וידאו: {property.video.type === 'generated' ? 'נוצר מתמונות' : 'הועלה ישירות'}
                </p>
              </div>
            )}

            {/* Images Carousel */}
            {property.images && property.images.length > 0 && (
              <div>
                <ImageCarousel images={property.images} />
                {property.contentType === 'video-from-images' && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    תמונות המקור ששימשו ליצירת הסרטון
                  </p>
                )}
              </div>
            )}
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
                      <span>
                        {property.location}
                        {property.country ? `, ${property.country}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-2xl font-bold text-blue-600">
                      ₪{formatPrice(property.price)}
                    </div>
                    <DealScoreBadgeLarge dealScore={property.dealScore} />
                  </div>
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-200 mb-6">
                  {!isLandType(property.propertyType) && (
                    <div className="flex flex-col items-center">
                      <FaBed className="h-6 w-6 text-[#08171f] mb-2" />
                      <span className="text-lg text-black font-semibold">{property.bedrooms}</span>
                      <span className="text-sm text-gray-600">חדרים</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex flex-col items-center">
                      <FaBath className="h-6 w-6 text-[#08171f] mb-2" />
                      <span className="text-lg text-black font-semibold">{property.bathrooms}</span>
                      <span className="text-sm text-gray-600">חדרי רחצה</span>
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <FaRuler className="h-6 w-6 text-[#08171f] mb-2" />
                    <span className="text-lg text-black font-semibold">{property.area}</span>
                    <span className="text-sm text-gray-600">מ"ר</span>
                  </div>
                  {property.floor && (
                    <div className="flex flex-col items-center">
                      <FaBuilding className="h-6 w-6 text-[#08171f] mb-2" />
                      <span className="text-lg text-black font-semibold">{property.floor}</span>
                      <span className="text-sm text-gray-600">קומה</span>
                    </div>
                  )}
                  {property.parkingLots && property.parkingLots > 0 && (
                    <div className="flex flex-col items-center">
                      <FaParking className="h-6 w-6 text-[#08171f] mb-2" />
                      <span className="text-lg text-black font-semibold">{property.parkingLots}</span>
                      <span className="text-sm text-gray-600">{property.parkingLots === 1 ? 'חנייה' : 'חניות'}</span>
                    </div>
                  )}
                  {property.elevator && (
                    <div className="flex flex-col items-center">
                      <TbElevator className="h-6 w-6 text-[#08171f] mb-2" />
                      <span className="text-lg text-black font-semibold">מעלית</span>
                      <span className="text-sm text-gray-600">מעלית</span>
                    </div>
                  )}
                  {property.secureRoom && (
                    <div className="flex flex-col items-center">
                      <FaShieldAlt className="h-6 w-6 text-[#08171f] mb-2" />
                      <span className="text-lg text-black font-semibold">ממ"ד</span>
                      <span className="text-sm text-gray-600">ממ"ד</span>
                    </div>
                  )}
                  {property.accessibleEntrance && (
                    <div className="flex flex-col items-center">
                      <FaAccessibleIcon className="h-6 w-6 text-[#08171f] mb-2" />
                      <span className="text-lg text-black font-semibold">כניסה נגישה</span>
                      <span className="text-sm text-gray-600">כניסה נגישה</span>
                    </div>
                  )}
                  {property.airConditioning && (
                    <div className="flex flex-col items-center">
                      <TbAirConditioning className="h-6 w-6 text-[#08171f] mb-2" />
                      <span className="text-lg text-black font-semibold">מזגן</span>
                      <span className="text-sm text-gray-600">מזגן</span>
                    </div>
                  )}
                  {property.terrace && (  
                    <div className="flex flex-col items-center">
                      <MdBalcony className="h-6 w-6 text-[#08171f] mb-2" />
                      <span className="text-lg text-black font-semibold">מרפסת</span>
                      <span className="text-sm text-gray-600">מרפסת</span>
                    </div>
                  )}
                </div>

                {/* Property Type and Status */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {translatePropertyType(property.propertyType)}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    property.status === 'For Sale' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {property.status === 'For Sale' ? 'למכירה' : 'להשכרה'}
                  </span>
                  {property.agencyName && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      <FaBuilding className="ml-1" />
                      {property.agencyName}
                    </span>
                  )}
                  
                </div>

                {/* Descriptions */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-black">תיאור הנכס</h2>
                  
                  {/* General Description */}
                  {property.description && (
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-2">תיאור כללי</h3>
                      <div 
                        className="text-gray-600"
                        dangerouslySetInnerHTML={{ 
                          __html: property.description.startsWith('<') ? 
                            property.description : 
                            `<p>${property.description}</p>` 
                        }}
                      />
                    </div>
                  )}

                  {/* Hebrew and Arabic Descriptions */}
                  {(property.descriptions?.hebrew || property.descriptions?.arabic) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
                      {property.descriptions.hebrew && (
                        <div>
                          <h3 className="text-lg font-medium mb-2 text-right">תיאור בעברית</h3>
                          <div className="text-gray-600 text-right whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                            {property.descriptions.hebrew}
                          </div>
                        </div>
                      )}
                      
                      {property.descriptions.arabic && (
                        <div>
                          <h3 className="text-lg font-medium mb-2 text-right">وصف باللغة العربية</h3>
                          <div className="text-gray-600 text-right whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                            {property.descriptions.arabic}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {property.features && property.features.length > 0 && (
                  <div className="mb-6">
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

                {/* Additional Notes */}
                {property.notes && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 flex items-center">
                      <FaStickyNote className="ml-2 text-blue-600" />
                      הערות נוספות
                    </h2>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-line">{property.notes}</p>
                    </div>
                  </div>
                )}

                {/* Property Metadata */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-3 text-gray-800">פרטי הנכס</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">מספר נכס:</span>
                      <span className="font-mono text-gray-800">{property._id.slice(-8)}</span>
                    </div>
                    
                    {property.createdAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <FaClock className="ml-1" />
                          פורסם:
                        </span>
                        <span className="text-gray-800">
                          {formatDate(property.createdAt)}
                        </span>
                      </div>
                    )}
                    
                    {property.contentType && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">סוג תוכן:</span>
                        <span className="text-gray-800">
                          {property.contentType === 'video' ? 'סרטון' :
                           property.contentType === 'video-from-images' ? 'סרטון מתמונות' :
                           property.contentType === 'carousel' ? 'גלריה' : 'תמונה יחידה'}
                        </span>
                      </div>
                    )}

                    {property.country && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">מדינה:</span>
                        <span className="text-gray-800">{property.country}</span>
                      </div>
                    )}

                    {property.landArea && Number(property.landArea) > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">שטח מגרש:</span>
                        <span className="text-gray-800">{property.landArea} מ"ר</span>
                      </div>
                    )}

                    {property.gardenArea && Number(property.gardenArea) > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">שטח גינה:</span>
                        <span className="text-gray-800">{property.gardenArea} מ"ר</span>
                      </div>
                    )}

                    {property.parkingLots && Number(property.parkingLots) > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">חניה:</span>
                        <span className="text-gray-800">
                          {property.parkingLots === 1 ? 'חנייה בטאבו' : `${property.parkingLots} חניות בטאבו`}
                        </span>
                      </div>
                    )}
                    {property.propertyCategory && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">קטגוריית נכס:</span>
                        <span className="text-gray-800">
                          {property.propertyCategory === 'residential'
                            ? 'מגורים'
                            : property.propertyCategory === 'commercial'
                              ? 'מסחרי'
                              : property.propertyCategory === 'land'
                                ? 'קרקע'
                                : property.propertyCategory}
                        </span>
                      </div>
                    )}
                    
                    {property.inquiries && (
                      <div className="md:col-span-2 pt-2 border-t border-gray-200">
                        <span className="text-gray-600 block mb-2">פעילות הנכס:</span>
                        <div className="flex gap-4">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            WhatsApp: {property.inquiries.whatsapp || 0}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            אימייל: {property.inquiries.email || 0}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            שיחות: {property.inquiries.calls || 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
                {(property.user.agencyName || property.agencyName) && (
                  <div className="flex items-center justify-center text-gray-600 mt-1">
                    <FaBuilding className="ml-2" />
                    <span className="text-sm">{property.user.agencyName || property.agencyName}</span>
                  </div>
                )}
               
              </div>

              <div className="space-y-4">
                {property.user.phone && (
                  <a
                    href={`tel:${property.user.phone}`}
                    className="flex items-center justify-center w-full px-4 py-2 bg-[#08171f] text-white rounded-lg hover:bg-[#F6F6F6] hover:text-[#08171f] transition-colors"
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
                <h3 className="text-lg font-semibold mb-2 text-black">אודות הסוכן</h3>
                <p className="text-gray-600 text-sm">{property.user.bio}</p>
                <Link
                  href={`/agents/${property.user.slug}`}
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