import Image from 'next/image';
import Link from 'next/link';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt } from 'react-icons/fa';
import DealScoreBadge from './DealScoreBadge';

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
    video,
    contentType,
    status,
    dealScore
  } = property;

  // Format price consistently
  const formatPrice = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper to detect video URLs (Cloudinary/video files)
  const isVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return /\.(mp4|webm|ogg)$/i.test(url) || url.includes('/video/upload');
  };

  // Prepare preview media logic:
  // - video, video-from-images: use video.secure_url
  // - carousel: if any item is a video, use the first video; otherwise use first image
  // - otherwise: first image
  const carouselVideos = Array.isArray(images) ? images.filter(m => isVideoUrl(m?.secure_url)) : [];
  const firstCarouselVideo = carouselVideos.length > 0 ? carouselVideos[0]?.secure_url : null;
  const firstImage = Array.isArray(images) ? (images.find(m => !isVideoUrl(m?.secure_url))?.secure_url || images[0]?.secure_url) : null;

  const previewIsVideo = (contentType === 'video' || contentType === 'video-from-images')
    || (contentType === 'carousel' && !!firstCarouselVideo);
  const previewVideoSrc = (contentType === 'video' || contentType === 'video-from-images')
    ? (video?.secure_url || firstCarouselVideo)
    : (contentType === 'carousel' ? firstCarouselVideo : null);
  const previewImageSrc = firstImage || '/logo-original.jpeg';

  return (
    <Link href={`/properties/${_id}`}>
      <div className="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-56 w-full">
          {previewIsVideo ? (
            // Show autoplay muted video for video-only properties
            <video
              src={previewVideoSrc || '/logo-original.jpeg'}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            // Show image for image properties (keep current behavior)
            <Image
              src={previewImageSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity duration-300 group-hover:bg-opacity-30" />
          {/* Status badge - always in the same position */}
          <div className="absolute top-4 right-4">
            <div className="bg-[#2274a0] text-[#F6F6F6] px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              {status === 'For Sale' ? 'למכירה' : 'להשכרה'}
            </div>
          </div>
          {/* Deal score badge - positioned below status badge */}
          <div className="absolute top-[3.5rem] right-4">
            <DealScoreBadge dealScore={dealScore} className="shadow-lg" />
          </div>
        </div>
        
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{title}</h3>
          
          <div className="flex items-center text-gray-600 mb-3">
            <FaMapMarkerAlt className="ml-2 text-[#08171f]" />
            <p className="text-sm line-clamp-1">{location}</p>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-2xl font-bold text-[#08171f]">
              ₪{formatPrice(price)}
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-gray-600 border-t pt-4">
            <div className="flex flex-col gap-2 items-center justify-center border-l border-gray-200">
              <FaBed className="ml-2 text-[#08171f]" />
              <span className="text-sm text-center">{bedrooms} חדרים</span>
            </div>
            <div className="flex flex-col gap-2 items-center justify-center ">
              <FaBath className="ml-2 text-[#08171f]" />
              <span className="text-sm text-center">{bathrooms} חדרי רחצה</span>
            </div>
            <div className="flex flex-col gap-2 items-center justify-center border-r border-gray-200">
              <FaRuler className="ml-2 text-[#08171f]" />
              <span className="text-sm text-center">{area} מ"ר</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard; 