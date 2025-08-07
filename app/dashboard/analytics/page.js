'use client';
import { useState, useEffect } from 'react';
import { 
  FaEye, 
  FaWhatsapp, 
  FaEnvelope, 
  FaPhone, 
  FaBuilding, 
  FaChartLine, 
  FaCalendarAlt, 
  FaMapMarkerAlt,
  FaUserTie,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaStar,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaUsers
} from 'react-icons/fa';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    conversionRate: 0,
    inquiries: {
      whatsapp: 0,
      email: 0,
      calls: 0
    },
    propertiesByStatus: {
      'For Sale': 0,
      'For Rent': 0
    },
    propertiesByType: {},
    recentInquiries: [],
    topPerformingProperties: [],
    monthlyTrends: {
      views: [],
      inquiries: []
    },
    totalClients: 0,
    totalCalls: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateConversionRate = () => {
    return stats.conversionRate || 0;
  };

  const getTopPropertyTypes = () => {
    return Object.entries(stats.propertiesByType || {})
      .filter(([_, count]) => count > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">אנליטיקה מקצועית</h1>
              <p className="text-gray-600 mt-2">סקירה מקיפה של הביצועים והפעילות שלך</p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center text-sm text-gray-500">
                <FaCalendarAlt className="w-4 h-4 ml-2" />
                {new Date().toLocaleDateString('he-IL', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">סה"כ צפיות</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <FaArrowUp className="w-4 h-4 text-green-500 ml-1" />
                  <span className="text-sm text-green-600 font-medium">+12%</span>
                  <span className="text-sm text-gray-500 mr-2">מהחודש שעבר</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <FaEye className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">סה"כ פניות</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalInquiries.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <FaArrowUp className="w-4 h-4 text-green-500 ml-1" />
                  <span className="text-sm text-green-600 font-medium">+8%</span>
                  <span className="text-sm text-gray-500 mr-2">מהחודש שעבר</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <FaPhone className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">אחוז המרה</p>
                <p className="text-3xl font-bold text-gray-900">{calculateConversionRate()}%</p>
                <div className="flex items-center mt-2">
                  <FaArrowUp className="w-4 h-4 text-green-500 ml-1" />
                  <span className="text-sm text-green-600 font-medium">+2.1%</span>
                  <span className="text-sm text-gray-500 mr-2">מהחודש שעבר</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <FaChartLine className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">נכסים פעילים</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProperties}</p>
                <div className="flex items-center mt-2">
                  <FaCheckCircle className="w-4 h-4 text-blue-500 ml-1" />
                  <span className="text-sm text-blue-600 font-medium">פעיל</span>
                  <span className="text-sm text-gray-500 mr-2">במערכת</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <FaBuilding className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">לקוחות</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
                <div className="flex items-center mt-2">
                  <FaUsers className="w-4 h-4 text-indigo-500 ml-1" />
                  <span className="text-sm text-indigo-600 font-medium">פעילים</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-indigo-100">
                <FaUsers className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">שיחות</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCalls}</p>
                <div className="flex items-center mt-2">
                  <FaPhone className="w-4 h-4 text-teal-500 ml-1" />
                  <span className="text-sm text-teal-600 font-medium">נרשמו</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-teal-100">
                <FaPhone className="h-8 w-8 text-teal-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Inquiry Breakdown */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">פילוח פניות</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaWhatsapp className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.inquiries.whatsapp}</p>
                <p className="text-sm text-gray-600">פניות בוואטסאפ</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(stats.inquiries.whatsapp / Math.max(stats.totalInquiries, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaEnvelope className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.inquiries.email}</p>
                <p className="text-sm text-gray-600">פניות במייל</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(stats.inquiries.email / Math.max(stats.totalInquiries, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaPhone className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.inquiries.calls}</p>
                <p className="text-sm text-gray-600">שיחות טלפון</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: `${(stats.inquiries.calls / Math.max(stats.totalInquiries, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">סטטוס נכסים</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full ml-3"></div>
                  <span className="text-gray-700">למכירה</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{stats.propertiesByStatus['For Sale'] || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full ml-3"></div>
                  <span className="text-gray-700">להשכרה</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{stats.propertiesByStatus['For Rent'] || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Property Types and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Property Types */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">נכסים לפי סוג</h2>
            <div className="space-y-4">
              {getTopPropertyTypes().map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaBuilding className="w-4 h-4 text-gray-400 ml-2" />
                    <span className="text-gray-700">{type}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-900 ml-3">{count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / Math.max(...Object.values(stats.propertiesByType || {}))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">פעילות אחרונה</h2>
            <div className="space-y-4">
              {stats.recentInquiries.slice(0, 5).map((inquiry, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {inquiry.type === 'WhatsApp' && <FaWhatsapp className="w-5 h-5 text-green-600" />}
                    {inquiry.type === 'Email' && <FaEnvelope className="w-5 h-5 text-purple-600" />}
                    {inquiry.type === 'Call' && <FaPhone className="w-5 h-5 text-yellow-600" />}
                  </div>
                  <div className="mr-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{inquiry.propertyTitle}</p>
                    <p className="text-xs text-gray-500">{inquiry.type} - {inquiry.clientName}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(inquiry.date).toLocaleDateString('he-IL')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">תובנות ביצועים</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <FaStar className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ביצועים מעולים</h3>
              <p className="text-sm text-gray-600">אחוז המרה גבוה מהממוצע בתעשייה</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FaArrowUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">צמיחה חיובית</h3>
              <p className="text-sm text-gray-600">עלייה של 12% בצפיות החודש</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <FaExclamationTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">נדרש שיפור</h3>
              <p className="text-sm text-gray-600">יש מקום לשיפור בתגובתיות לפניות</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 