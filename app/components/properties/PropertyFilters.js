'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import { countryOptions } from '../../utils/countryOptions';

const propertyTypes = [
  { value: 'house', label: 'בית פרטי' },
  { value: 'apartment', label: 'דירה' },
  { value: 'condo', label: 'דירת גן' },
  { value: 'villa', label: 'וילה' },
  { value: 'land', label: 'מגרש' },
  { value: 'commercial', label: 'מסחרי' },
  { value: 'office', label: 'משרד' },
  { value: 'warehouse', label: 'מחסן' },
  { value: 'other', label: 'אחר' },
  { value: 'cottage', label: `קוטג'/קיר משותף'`},
  { value: 'duplex', label: 'דופלקס' }
];

const propertyStatus = [
  { value: 'For Sale', label: 'למכירה' },
  { value: 'For Rent', label: 'להשכרה' }
];

const bedroomOptions = [
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' }
];

export default function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [countries, setCountries] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Get the initial type from URL
  const initialType = searchParams?.get('type')?.toLowerCase() || '';
  
  const [filters, setFilters] = useState({
    location: searchParams?.get('location') || '',
    type: initialType,
    status: searchParams?.get('status') || '',
    maxPrice: searchParams?.get('maxPrice') || '',
    bedrooms: searchParams?.get('bedrooms') || '',
    country: searchParams?.get('country') || ''
  });

  // Update filters when URL changes
  useEffect(() => {
    const type = searchParams?.get('type')?.toLowerCase() || '';
    setFilters(prev => ({
      ...prev,
      type: type
    }));
  }, [searchParams]);

  // Load countries once
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/properties/countries');
        const data = await res.json();
        if (isMounted && Array.isArray(data.countries)) {
          setCountries(data.countries);
        }
      } catch {}
    })();
    return () => { isMounted = false; };
  }, []);

  // Load locations based on selected country (or all if not selected)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const qs = filters.country ? `?country=${encodeURIComponent(filters.country)}` : '';
        const res = await fetch(`/api/properties/locations${qs}`);
        const data = await res.json();
        if (isMounted && Array.isArray(data.locations)) {
          setLocations(data.locations);
        }
      } catch {}
    })();
    return () => { isMounted = false; };
  }, [filters.country]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    router.push(`/properties?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      type: '',
      status: '',
      maxPrice: '',
      bedrooms: '',
      country: ''
    });
    router.push('/properties');
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">סינון נכסים</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <FaSearch className="h-5 w-5" />
          <span className="mr-2">סינון</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
           {/* Country */}
           <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              מדינה
            </label>
            <select
              id="country"
              name="country"
              value={filters.country}
              onChange={handleInputChange}
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">הכל</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              מיקום
            </label>
            <select
              id="location"
              name="location"
              value={filters.location}
              onChange={handleInputChange}
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">הכל</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              סוג נכס
            </label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleInputChange}
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">הכל</option>
              <option value="house">בית פרטי</option>
              <option value="apartment">דירה</option>
              <option value="condo">דירת גן</option>
              <option value="villa">וילה</option>
              <option value="land">מגרש</option>
              <option value="commercial">מסחרי</option>
              <option value="office">משרד</option>
              <option value="warehouse">מחסן</option>
              <option value="other">אחר</option>
              <option value="cottage">קוטג'/קיר משותף</option>
              <option value="duplex">דופלקס</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              סטטוס
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">הכל</option>
              <option value="For Sale">למכירה</option>
              <option value="For Rent">להשכרה</option>
            </select>
          </div>

         

          {/* Max Price */}
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
              מחיר מקסימלי
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleInputChange}
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="מחיר מקסימלי"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
              חדרי שינה
            </label>
            <select
              id="bedrooms"
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleInputChange}
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">הכל</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2 justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            נקה סינון
          </button>
          <button
            type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#08171f] hover:bg-[#F6F6F6] hover:text-[#08171f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaSearch className="h-4 w-4 ml-2" />
            חפש
          </button>
        </div>
      </form>
    </div>
  );
} 