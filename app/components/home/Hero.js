'use client';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

const Hero = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    location: searchParams?.get('location') || '',
    propertyType: searchParams?.get('type') || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.location) queryParams.set('location', filters.location);
    if (filters.propertyType) queryParams.set('type', filters.propertyType);
    
    // Navigate to properties page with filters
    router.push(`/properties?${queryParams.toString()}`);
  };

  return (
    <div className="relative h-[600px] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-bg.jpeg"
          alt="תמונת רקע נדל״ן"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          מצא את בית חלומותיך
        </h1>
        <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
          גלה את הנכס המושלם מתוך המבחר הרחב שלנו של בתים, דירות ונכסי יוקרה
        </p>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleChange}
                placeholder="איזור"
                className="h-12 w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="sm:w-48">
              <select
                name="propertyType"
                value={filters.propertyType}
                onChange={handleChange}
                className="h-12 w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">סוג נכס</option>
                <option value="house">בית פרטי</option>
                <option value="apartment">דירה</option>
                <option value="condo">דירת גן</option>
                <option value="villa">וילה</option>
                <option value="land">מגרש</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              חיפוש
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Hero; 