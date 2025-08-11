'use client';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
// import { FaSearch } from 'react-icons/fa';
import { cityOptions } from '../../utils/cityOptions';
// Dynamic countries will be fetched from API based on existing properties

const Hero = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    country: searchParams?.get('country') || '',
    location: searchParams?.get('location') || '',
    propertyType: searchParams?.get('type') || ''
  });
  const [countries, setCountries] = useState([]);
  const [locations, setLocations] = useState([]);

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
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');

  const filteredCities = cityOptions.filter(city =>
    city.label.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCitySelect = (cityValue) => {
    setFilters(prev => ({ ...prev, location: cityValue }));
    setShowCityDropdown(false);
    setCitySearchTerm('');
  };

  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, location: value }));
    setCitySearchTerm(value);
    setShowCityDropdown(true);
  };

  const handleLocationInputBlur = () => {
    // Delay hiding dropdown to allow for selection
    setTimeout(() => {
      setShowCityDropdown(false);
    }, 200);
  };

  const handleLocationInputFocus = () => {
    setShowCityDropdown(true);
    setCitySearchTerm(filters.location);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.country) queryParams.set('country', filters.country);
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
            <div className="sm:w-48">
              <select
                name="country"
                value={filters.country}
                onChange={handleChange}
                className="h-12 w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">מדינה</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                name="location"
                value={filters.location}
                onChange={handleChange}
                className="h-12 w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">אזור</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
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
                <option value="commercial">מסחרי</option>
                <option value="office">משרד</option>
                <option value="warehouse">מחסן</option>
                <option value="other">אחר</option>
                <option value="cottage">קוטג'/קיר משותף</option>
                <option value="duplex">דופלקס</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-[#08171f] hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
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