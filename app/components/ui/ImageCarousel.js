'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full">
      {/* Main Image Container */}
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
        <Image
          src={images[currentIndex]?.secure_url}
          alt={`תמונה ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority={currentIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        />
        {/* Gradient overlays for better text/button contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      {!isMobile && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 p-2 md:p-3 rounded-full hover:bg-white transition-colors shadow-lg"
            aria-label="Previous image"
          >
            <FaChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 p-2 md:p-3 rounded-full hover:bg-white transition-colors shadow-lg"
            aria-label="Next image"
          >
            <FaChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </>
      )}

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 md:space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white scale-110' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Thumbnails - Hidden on mobile */}
      {!isMobile && (
        <div className="hidden md:flex justify-center space-x-2 mt-4 px-4 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative flex-shrink-0 h-14 w-20 rounded-lg overflow-hidden transition-all ${
                index === currentIndex 
                  ? 'ring-2 ring-blue-600 opacity-100' 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={image.secure_url}
                alt={`תמונה ממוזערת ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 