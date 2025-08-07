'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaUserTie, FaCalendarAlt, FaAward, FaBed, FaBath, FaRuler, FaInstagram, FaFacebook, FaEye, FaCalendar } from 'react-icons/fa';
import PropertyCard from '../ui/PropertyCard';
import Link from 'next/link';

export default function AgentProfile({ agent }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    propertyType: ''
  });
  console.log(agent)
  
  // Initialize analytics state with the data from props
  const [analytics, setAnalytics] = useState({
    profileViews: agent.interactions?.profileViews || 0,
    whatsapp: agent.interactions?.whatsapp || 0,
    email: agent.interactions?.email || 0,
    phone: agent.interactions?.phone || 0
  });

  useEffect(() => {
    let isMounted = true;

    if (!mounted) {
      setMounted(true);
      // Only track view if we have a valid agent ID - but don't break if it fails
      if (agent?._id) {
        trackView().catch(error => {
          console.warn('Tracking failed, but continuing normally:', error);
        });
      }
    }

    return () => {
      isMounted = false;
    };
  }, [mounted, agent?._id]);

  const trackView = async () => {
    try {
      // Skip tracking if no valid agent ID
      if (!agent?._id) {
        console.warn('No agent ID available for tracking');
        return;
      }

      const res = await fetch(`/api/agents/${agent._id}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'profile' }),
        cache: 'no-store'
      });

      // If tracking fails, just log and continue - don't break the page
      if (!res.ok) {
        console.warn('Tracking failed with status:', res.status);
        return;
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Tracking response is not JSON, skipping');
        return;
      }

      const data = await res.json();
      if (data.agent?.interactions) {
        setAnalytics({
          profileViews: data.agent.interactions.profileViews || 0,
          whatsapp: data.agent.interactions.whatsapp || 0,
          email: data.agent.interactions.email || 0,
          phone: data.agent.interactions.phone || 0
        });
      }
    } catch (error) {
      // Just log the error, don't break the page
      console.warn('Tracking error (non-critical):', error.message);
    }
  };

  const trackInteraction = async (type) => {
    try {
      // Skip tracking if no valid agent ID
      if (!agent?._id) {
        console.warn('No agent ID available for interaction tracking');
        return;
      }
      
      const res = await fetch(`/api/agents/${agent._id}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
        cache: 'no-store'
      });

      // If tracking fails, just log and continue - don't break functionality
      if (!res.ok) {
        console.warn('Interaction tracking failed with status:', res.status);
        return;
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Interaction tracking response is not JSON, skipping');
        return;
      }

      const data = await res.json();
      if (data.agent?.interactions) {
        setAnalytics({
          profileViews: data.agent.interactions.profileViews || 0,
          whatsapp: data.agent.interactions.whatsapp || 0,
          email: data.agent.interactions.email || 0,
          phone: data.agent.interactions.phone || 0
        });
      }
    } catch (error) {
      // Just log the error, don't break functionality
      console.warn('Interaction tracking error (non-critical):', error.message);
    }
  };

  const handleContactClick = (type) => {
    try {
      trackInteraction(type);
      if (type === 'phone' && agent.phone) {
        window.location.href = `tel:${agent.phone}`;
      }
    } catch (error) {
      console.error('Error handling contact click:', error);
    }
  };

  const handleSocialMediaClick = (platform) => {
    try {
      trackInteraction('social');
      
      let url;
      if (platform === 'instagram' && agent.socialMedia?.instagram) {
        url = `https://instagram.com/${agent.socialMedia.instagram}`;
      } else if (platform === 'facebook' && agent.socialMedia?.facebook) {
        url = agent.socialMedia.facebook.startsWith('http') 
          ? agent.socialMedia.facebook
          : `https://www.facebook.com/${agent.socialMedia.facebook}`;
      }

      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error handling social media click:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate filtered properties
  const filteredProperties = mounted ? agent.properties?.filter(property => {
    if (activeTab !== 'all' && property.status !== activeTab) return false;
    if (filters.minPrice && property.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && property.price > Number(filters.maxPrice)) return false;
    if (filters.bedrooms && property.bedrooms !== Number(filters.bedrooms)) return false;
    if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
    return true;
  }) : agent.properties || [];

  // Calculate property counts
  const propertyCounts = {
    all: agent.properties?.length || 0,
    'For Sale': agent.properties?.filter(p => p.status === 'For Sale').length || 0,
    'For Rent': agent.properties?.filter(p => p.status === 'For Rent').length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
        <div className="relative h-64 bg-[#3a6074]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#3a6074] to-[#1a3f53] opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32">
        <div className="relative">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Image & Contact */}
                <div className="md:w-1/3">
                  <div className="text-center">
                    <div className="relative h-48 w-48 mx-auto mb-6">
                      <Image
                        src={agent.profileImage?.secure_url || '/placeholder-agent.jpg'}
                        alt={agent.fullName}
                        fill
                        sizes="(max-width: 768px) 192px, 192px"
                        className="rounded-xl object-cover shadow-lg"
                        priority
                      />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {agent.fullName}
                    </h1>
                    <div className="flex items-center justify-center text-[#2274a0]   mb-6 gap-2">
                      <FaUserTie className="mr-2" />
                      <span className="font-medium">סוכן נדל"ן מוסמך</span>
                    </div>
                    {/* Social Media Links */}
                    {(agent.socialMedia?.facebook || agent.socialMedia?.instagram) && (
                      <div className="flex items-center gap-4 justify-center space-x-4 mb-6">
                        {agent.socialMedia?.facebook && (
                          <button
                            onClick={() => handleSocialMediaClick('facebook')}
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <FaFacebook className="h-6 w-6" />
                          </button>
                        )}
                        {agent.socialMedia?.instagram && (
                          <button
                            onClick={() => handleSocialMediaClick('instagram')}
                            className="text-gray-600 hover:text-pink-600 transition-colors"
                          >
                            <FaInstagram className="h-6 w-6" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#2274a0]">{propertyCounts.all}</div>
                        <div className="text-sm text-gray-600">נכסים</div>
                      </div>
                      {/* <div className="text-center border-r border-gray-200">
                        <div className="text-2xl font-bold text-blue-600">5+</div>
                        <div className="text-sm text-gray-600">שנות ניסיון</div>
                      </div> */}
                    </div>

                    {/* Contact Buttons */}
                    <div className="space-y-3">
                      {agent.phone && (
                        <button
                          onClick={() => handleContactClick('phone')}
                          className="flex items-center justify-center w-full px-6 py-3 bg-[#3a6074] text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          <FaPhone className="ml-2" />
                          <span>התקשר עכשיו</span>
                        </button>
                      )}
                      {agent.whatsapp && (
                        <a
                          href={`https://wa.me/${agent.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleContactClick('whatsapp')}
                          className="flex items-center justify-center w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                        >
                          <FaWhatsapp className="ml-2" />
                          <span>וואטסאפ</span>
                        </a>
                      )}
                       {agent.calendlyLink && (
                        <a
                          href={`${agent.calendlyLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          // onClick={() => handleContactClick('email')}
                          className="bg-gray-400 flex items-center justify-center w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <FaCalendar className="ml-2" />
                          <span>קבע פגישה</span>
                        </a>
                      )}
                      {agent.email && (
                        <a
                          href={`mailto:${agent.email}`}
                          onClick={() => handleContactClick('email')}
                          className="flex items-center justify-center w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <FaEnvelope className="ml-2" />
                          <span>שלח אימייל</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio & Properties */}
                <div className="md:w-2/3">
                  {/* Bio Section */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <FaUserTie className="ml-2 text-[#2274a0]" />
                      פרופיל מקצועי
                    </h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {agent.bio}
                    </p>
                    
                    {/* Additional Info */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="ml-2 text-[#2274a0]" />
                        <span>אזור פעילות: {agent.activityArea}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaAward className="ml-2 text-[#2274a0]" />
                        <span>רישיון תיווך: {agent.licenseNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Agency Information */}
                  {(agent.agencyName || agent.logo?.secure_url) && (
                    <div className="bg-gray-50 rounded-xl p-6 mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <FaUserTie className="ml-2 text-[#2274a0]" />
                        פרטי הסוכנות
                      </h2>
                      <div className="flex items-center gap-4">
                        {agent.logo?.secure_url && (
                          <div className="relative h-16 w-16">
                            <Image
                              src={agent.logo.secure_url}
                              alt={`${agent.agencyName} לוגו`}
                              fill
                              sizes="64px"
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{agent.agencyName}</h3>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Properties Section */}
                  <div>
                    {/* Tabs */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-6">
                      <button
                        onClick={() => setActiveTab('all')}
                        className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                          activeTab === 'all'
                            ? 'bg-[#3a6074] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span>כל הנכסים</span>
                        <span className="mr-2 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
                          {propertyCounts.all}
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveTab('For Sale')}
                        className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                          activeTab === 'For Sale'
                            ? 'bg-[#3a6074] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span>למכירה</span>
                        <span className="mr-2 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
                          {propertyCounts['For Sale']}
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveTab('For Rent')}
                        className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                          activeTab === 'For Rent'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span>להשכרה</span>
                        <span className="mr-2 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
                          {propertyCounts['For Rent']}
                        </span>
                      </button>
                    </div>

                    {/* Property Filters */}
                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                      <h3 className="text-lg font-semibold mb-4 text-black">סינון נכסים של {agent.fullName}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">מחיר מינימלי</label>
                          <input
                            type="number"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="מחיר מינימלי"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">מחיר מקסימלי</label>
                          <input
                            type="number"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="מחיר מקסימלי"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">חדרי שינה</label>
                          <select
                            name="bedrooms"
                            value={filters.bedrooms}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">הכל</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5+</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">סוג נכס</label>
                          <select
                            name="propertyType"
                            value={filters.propertyType}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">הכל</option>
                            <option value="House">בית פרטי</option>
                            <option value="Apartment">דירה</option>
                            <option value="Condo">דירת גן</option>
                            <option value="Villa">וילה</option>
                            <option value="Land">מגרש</option>
                            <option value="commercial">מסחרי</option>
                            <option value="office">משרד</option>
                            <option value="warehouse">מחסן</option>
                            <option value="other">אחר</option>
                            <option value="cottage">קוטג'/קיר משותף </option>
                            <option value="duplex">דופלקס</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Properties Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {filteredProperties.length > 0 ? (
                        filteredProperties.map((property) => (
                          <PropertyCard key={property._id} property={property} />
                        ))
                      ) : (
                        <p className="text-gray-500 text-center col-span-2 py-8 bg-gray-50 rounded-lg">
                          אין נכסים להצגה בקטגוריה זו
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>    
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaEye className="h-6 w-6" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">צפיות בפרופיל</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.profileViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaWhatsapp className="h-6 w-6" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">פניות בוואטסאפ</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.whatsapp}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaEnvelope className="h-6 w-6" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">פניות במייל</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaPhone className="h-6 w-6" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">שיחות טלפון</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 