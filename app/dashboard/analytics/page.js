'use client';
import { useState, useEffect } from 'react';
import { FaEye, FaWhatsapp, FaEnvelope, FaPhone } from 'react-icons/fa';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    inquiries: {
      whatsapp: 0,
      email: 0,
      calls: 0
    },
    propertiesByStatus: {
      'For Sale': 0,
      'For Rent': 0
    },
    propertiesByType: {
      House: 0,
      Apartment: 0,
      Condo: 0,
      Villa: 0,
      Land: 0,
      commercial: 0,
      cottage: 0,
      duplex: 0
    },
    recentInquiries: []
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

  if (loading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">אנליטיקה</h1>

      {/* Overview Stats 1*/}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaEye className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">סה"כ צפיות</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalViews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaWhatsapp className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">פניות בוואטסאפ</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inquiries.whatsapp}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaEnvelope className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">פניות במייל</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inquiries.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaPhone className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">שיחות טלפון</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inquiries.calls}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Properties by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">נכסים לפי סטטוס</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">למכירה</span>
              <span className="text-gray-900 font-medium">{stats.propertiesByStatus['For Sale']}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">להשכרה</span>
              <span className="text-gray-900 font-medium">{stats.propertiesByStatus['For Rent']}</span>
            </div>
          </div>
        </div>

        {/* Properties by Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">נכסים לפי סוג</h2>
          <div className="space-y-4">
            {Object.entries(stats.propertiesByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-600">{type}</span>
                <span className="text-gray-900 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Inquiries */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">פניות אחרונות</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  נכס
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סוג פנייה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תאריך
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentInquiries.map((inquiry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inquiry.propertyTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inquiry.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(inquiry.date).toLocaleDateString('he-IL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 