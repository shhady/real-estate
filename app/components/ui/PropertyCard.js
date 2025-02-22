import Image from 'next/image';
import Link from 'next/link';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt } from 'react-icons/fa';

const PropertyCard = ({ property }) => {
  const {
    _id,
    title,
    price,
    location,
    bedrooms,
    bathrooms,
    area,
    images,
    status
  } = property;

  // Format price consistently
  const formatPrice = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <Link href={`/properties/${_id}`}>
      <div className="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-56 w-full">
          <Image
            src={images[0]?.secure_url || '/placeholder-property.jpg'}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity duration-300 group-hover:bg-opacity-30" />
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            {status === 'For Sale' ? 'למכירה' : 'להשכרה'}
          </div>
        </div>
        
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{title}</h3>
          
          <div className="flex items-center text-gray-600 mb-3">
            <FaMapMarkerAlt className="ml-2 text-blue-600" />
            <p className="text-sm line-clamp-1">{location}</p>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-2xl font-bold text-blue-600">
              ₪{formatPrice(price)}
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-gray-600 border-t pt-4">
            <div className="flex flex-col gap-2 items-center justify-center border-l border-gray-200">
              <FaBed className="ml-2 text-blue-600" />
              <span className="text-sm text-center">{bedrooms} חדרים</span>
            </div>
            <div className="flex flex-col gap-2 items-center justify-center ">
              <FaBath className="ml-2 text-blue-600" />
              <span className="text-sm text-center">{bathrooms} חדרי רחצה</span>
            </div>
            <div className="flex flex-col gap-2 items-center justify-center border-r border-gray-200">
              <FaRuler className="ml-2 text-blue-600" />
              <span className="text-sm text-center">{area} מ"ר</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard; 