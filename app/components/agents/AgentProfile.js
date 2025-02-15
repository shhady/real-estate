'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaUserTie, FaCalendarAlt, FaAward, FaBed, FaBath, FaRuler, FaInstagram, FaFacebook, FaEye } from 'react-icons/fa';
import PropertyCard from '@/app/components/ui/PropertyCard';
import Link from 'next/link';

export default function AgentProfile({ agent }) {
  // Initialize state with default values that match server-side rendering
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    propertyType: ''
  });

  // Initialize analytics state with safe defaults
  const [analytics, setAnalytics] = useState({
    profileViews: {
      total: agent.analytics?.profileViews?.total || 0,
      unique: agent.analytics?.profileViews?.unique || 0
    },
    interactions: {
      whatsapp: {
        total: agent.analytics?.interactions?.whatsapp?.total || 0,
        unique: agent.analytics?.interactions?.whatsapp?.unique || 0
      },
      email: {
        total: agent.analytics?.interactions?.email?.total || 0,
        unique: agent.analytics?.interactions?.email?.unique || 0
      },
      phone: {
        total: agent.analytics?.interactions?.phone?.total || 0,
        unique: agent.analytics?.interactions?.phone?.unique || 0
      }
    }
  });

  // Only start client-side rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track view when profile is loaded
  useEffect(() => {
    const trackView = async () => {
      try {
        const res = await fetch(`/api/agents/${agent._id}/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: 'view' }),
        });

        if (res.ok) {
          const data = await res.json();
          // Update analytics while preserving existing values if new ones are undefined
          setAnalytics(prev => ({
            profileViews: {
              total: data.profileViews?.total ?? prev.profileViews.total,
              unique: data.profileViews?.unique ?? prev.profileViews.unique
            },
            interactions: {
              whatsapp: {
                total: data.interactions?.whatsapp?.total ?? prev.interactions.whatsapp.total,
                unique: data.interactions?.whatsapp?.unique ?? prev.interactions.whatsapp.unique
              },
              email: {
                total: data.interactions?.email?.total ?? prev.interactions.email.total,
                unique: data.interactions?.email?.unique ?? prev.interactions.email.unique
              },
              phone: {
                total: data.interactions?.phone?.total ?? prev.interactions.phone.total,
                unique: data.interactions?.phone?.unique ?? prev.interactions.phone.unique
              }
            }
          }));
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    if (mounted) {
      trackView();
    }
  }, [agent._id, mounted]);

  const trackInteraction = async (type, propertyId = null) => {
    try {
      const response = await fetch(`/api/agents/${agent._id}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, propertyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to track interaction');
      }

      const data = await response.json();
      
      // Update analytics while preserving existing values
      setAnalytics(prev => ({
        profileViews: {
          total: data.profileViews?.total ?? prev.profileViews.total,
          unique: data.profileViews?.unique ?? prev.profileViews.unique
        },
        interactions: {
          whatsapp: {
            total: data.interactions?.whatsapp?.total ?? prev.interactions.whatsapp.total,
            unique: data.interactions?.whatsapp?.unique ?? prev.interactions.whatsapp.unique
          },
          email: {
            total: data.interactions?.email?.total ?? prev.interactions.email.total,
            unique: data.interactions?.email?.unique ?? prev.interactions.email.unique
          },
          phone: {
            total: data.interactions?.phone?.total ?? prev.interactions.phone.total,
            unique: data.interactions?.phone?.unique ?? prev.interactions.phone.unique
          }
        }
      }));
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const handleContactClick = (type) => {
    trackInteraction(type);
  };

  const handlePropertyClick = (propertyId) => {
    // You could track property views here if needed
    trackInteraction('view', propertyId);
  };

  const handleSocialMediaClick = (platform) => {
    // You could add social media tracking here if needed
    const url = platform === 'instagram' 
      ? `https://instagram.com/${agent.socialMedia?.instagram}`
      : `https://facebook.com/${agent.socialMedia?.facebook}`;
    window.open(url, '_blank');
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

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/users/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      
      // data.summary - Overall statistics
      // data.propertyAnalytics - Per-property analytics
      // data.recentInteractions - Latest interactions
      // data.dailyAnalytics - Daily interaction counts
      // data.propertiesByStatus - Property distribution
      
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative h-64 bg-blue-600">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-90"></div>
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
                    <div className="flex items-center justify-center text-blue-600 mb-6 gap-2">
                      <FaUserTie className="mr-2" />
                      <span className="font-medium">סוכן נדל"ן מוסמך</span>
                    </div>
                    {(agent.socialMedia?.facebook || agent.socialMedia?.instagram) && (
                      <div className="flex items-center gap-4 justify-center space-x-4 mb-6">
                        {agent.socialMedia.facebook && (
                          <a
                            href={agent.socialMedia.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <FaFacebook className="h-6 w-6" />
                          </a>
                        )}
                        {agent.socialMedia.instagram && (
                          <a
                            href={`https://instagram.com/${agent.socialMedia.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-pink-600 transition-colors"
                          >
                            <FaInstagram className="h-6 w-6" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{propertyCounts.all}</div>
                        <div className="text-sm text-gray-600">נכסים</div>
                      </div>
                      <div className="text-center border-r border-gray-200">
                        <div className="text-2xl font-bold text-blue-600">5+</div>
                        <div className="text-sm text-gray-600">שנות ניסיון</div>
                      </div>
                    </div>

                    {/* Contact Buttons */}
                    <div className="space-y-3">
                      {agent.phone && (
                        <button
                          onClick={() => handleContactClick('phone')}
                          className="flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
                      {agent.email && (
                        <a
                          href={`mailto:${agent.email}`}
                          onClick={() => handleContactClick('email')}
                          className="flex items-center justify-center w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <FaEnvelope className="ml-2" />
                          <span>שלח הודעה</span>
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
                      <FaUserTie className="ml-2 text-blue-600" />
                      פרופיל מקצועי
                    </h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {agent.bio}
                    </p>
                    
                    {/* Additional Info */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="ml-2 text-blue-600" />
                        <span>אזור פעילות: {agent.activityArea}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaAward className="ml-2 text-blue-600" />
                        <span>רישיון תיווך: {agent.licenseNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Properties Section */}
                  <div>
                    {/* Tabs */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-6">
                      <button
                        onClick={() => setActiveTab('all')}
                        className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                          activeTab === 'all'
                            ? 'bg-blue-600 text-white'
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
                            ? 'bg-blue-600 text-white'
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
                      <h3 className="text-lg font-semibold mb-4">סינון נכסים</h3>
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
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Properties Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {filteredProperties.length > 0 ? (
                        filteredProperties.map((property, index) => (
                          <Link key={property._id} href={`/properties/${property._id}`}>
                            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                              <div className="relative h-48 w-full">
                                <Image
                                  src={property.images[0]?.secure_url || '/placeholder-property.jpg'}
                                  alt={property.title}
                                  fill
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  className="object-cover"
                                  priority={index === 0}
                                />
                                <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
                                  {property.status === 'For Sale' ? 'למכירה' : 'להשכרה'}
                                </div>
                              </div>
                              
                              <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{property.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                                <p className="text-blue-600 text-xl font-bold mb-4">
                                  ₪{property.price.toLocaleString()}
                                </p>
                                
                                <div className="flex justify-between text-gray-600">
                                  <div className="flex items-center">
                                    <FaBed className="mr-2" />
                                    <span>{property.bedrooms}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <FaBath className="mr-2" />
                                    <span>{property.bathrooms}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <FaRuler className="mr-2" />
                                    <span>{property.area} m²</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaEye className="h-6 w-6" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">צפיות בפרופיל</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{analytics.profileViews.total}</p>
                  <p className="mr-2 text-sm text-gray-500">({analytics.profileViews.unique} ייחודי)</p>
                </div>
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
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{analytics.interactions.whatsapp.total}</p>
                  <p className="mr-2 text-sm text-gray-500">({analytics.interactions.whatsapp.unique} ייחודי)</p>
                </div>
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
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{analytics.interactions.email.total}</p>
                  <p className="mr-2 text-sm text-gray-500">({analytics.interactions.email.unique} ייחודי)</p>
                </div>
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
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{analytics.interactions.phone.total}</p>
                  <p className="mr-2 text-sm text-gray-500">({analytics.interactions.phone.unique} ייחודי)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Property Analytics */}
        {/* <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">סטטיסטיקות נכסים</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">סה"כ נכסים</span>
              <span className="font-semibold">{propertyCounts.all}</span>
            </div>
            <div className="border-t pt-4">
              <h4 className="text-md font-medium mb-2">נכסים לפי סטטוס</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">למכירה</span>
                  <span className="font-semibold">{propertyCounts['For Sale']}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">להשכרה</span>
                  <span className="font-semibold">{propertyCounts['For Rent']}</span>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
} 