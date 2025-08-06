import { Suspense } from 'react';
import { FaEye, FaWhatsapp, FaEnvelope, FaPhone, FaHome, FaPlus, FaUserTie, FaChartBar } from 'react-icons/fa';
import connectDB from '../lib/mongodb';
import Property from '../models/Property';
import User from '../models/User';
import { getUser } from '../lib/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DashboardPage() {
  try {
    const user = await getUser();
    if (!user) {
      return null;
    }

    await connectDB();
    
    // Fetch user data with interactions
    const userData = await User.findById(user.userId)
      .select('interactions')
      .lean();

    // Set default values if interactions is undefined
    const interactions = userData?.interactions || {
      whatsapp: 0,
      email: 0,
      phone: 0,
      profileViews: 0
    };

    // Fetch user's properties
    const properties = await Property.find({ user: user.userId })
      .select('title createdAt status price inquiries')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .catch(err => {
        console.error('Error fetching properties:', err);
        return [];
      });

    // Calculate total inquiries across all properties
    const totalInquiries = properties.reduce((total, property) => {
      const propertyInquiries = property.inquiries || {};
      return total + (
        (propertyInquiries.whatsapp || 0) +
        (propertyInquiries.email || 0) +
        (propertyInquiries.calls || 0)
      );
    }, 0);

    // Calculate total interactions
    const totalInteractions = 
      interactions.whatsapp +
      interactions.email +
      interactions.phone;

    const stats = [
      {
        id: 1,
        name: 'צפיות בפרופיל',
        total: interactions.profileViews,
        icon: <FaEye className="h-6 w-6 text-blue-500" />,
        color: 'bg-blue-50'
      },
      {
        id: 2,
        name: 'פניות בוואטסאפ',
        total: interactions.whatsapp,
        icon: <FaWhatsapp className="h-6 w-6 text-green-500" />,
        color: 'bg-green-50'
      },
      {
        id: 3,
        name: 'פניות במייל',
        total: interactions.email,
        icon: <FaEnvelope className="h-6 w-6 text-purple-500" />,
        color: 'bg-purple-50'
      },
      {
        id: 4,
        name: 'שיחות טלפון',
        total: interactions.phone,
        icon: <FaPhone className="h-6 w-6 text-yellow-500" />,
        color: 'bg-yellow-50'
      }
    ];

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">לוח בקרה</h1>
          <div className="text-sm text-gray-500">
            סה"כ נכסים: {properties.length} | סה"כ פניות: {totalInteractions}
          </div>
        </div>
        
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const cardContent = (
              <div
                key={item.id}
                className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 rounded-lg overflow-hidden shadow"
              >
                <dt>
                  <div className={`absolute rounded-md p-3 ${item.color}`}>
                    {item.icon}
                  </div>
                  <p className="mr-16 text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </p>
                </dt>
                <dd className="mr-16 pb-6 flex flex-col sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">{item.total}</p>
                </dd>
              </div>
            );

            // Make profile views card clickable
            if (item.id === 1) {
              return (
                <Link key={item.id} href="dashboard/profile" className="block hover:shadow-lg transition-shadow">
                  {cardContent}
                </Link>
              );
            }

            return cardContent;
          })}
        </div>

        <div className="mt-8">
          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">פעולות מהירות</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="dashboard/properties/upload" className="inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FaPlus className="h-5 w-5 ml-2" />
                הוספת נכס חדש
              </Link>

              <Link href="dashboard/profile" className="inline-flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <FaUserTie className="h-5 w-5 ml-2" />
                עריכת פרופיל
              </Link>

              <Link href="dashboard/properties" className="inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <FaHome className="h-5 w-5 ml-2" />
                ניהול נכסים
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in DashboardPage:', error);
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>אירעה שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.</p>
        </div>
      </div>
    );
  }
}