import { FaEye, FaWhatsapp, FaEnvelope, FaPhone, FaHome, FaPlus, FaUserTie, FaChartBar } from 'react-icons/fa';
import connectDB from '@/app/lib/mongodb';
import Property from '@/app/models/Property';
import User from '@/app/models/User';
import { getUser } from '@/app/lib/auth';
import Link from 'next/link';

export default async function DashboardPage() {
  try {
    const user = await getUser();
    if (!user) {
      return null;
    }

    await connectDB();
    
    // Fetch user data with analytics
    const userData = await User.findById(user.userId)
      .select('analytics')
      .lean();

    // Set default values if analytics is undefined
    const analytics = userData?.analytics || {
      profileViews: { total: 0, unique: 0 },
      interactions: {
        whatsapp: { total: 0, unique: 0 },
        email: { total: 0, unique: 0 },
        phone: { total: 0, unique: 0 }
      }
    };

    // Fetch user's properties
    const properties = await Property.find({ user: user.userId })
      .select('title createdAt status price inquiries')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

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
      analytics.interactions.whatsapp.total +
      analytics.interactions.email.total +
      analytics.interactions.phone.total;

    const stats = [
      {
        id: 1,
        name: 'צפיות בפרופיל',
        total: analytics.profileViews.total,
        unique: analytics.profileViews.unique,
        icon: <FaEye className="h-6 w-6 text-blue-500" />,
        color: 'bg-blue-50'
      },
      {
        id: 2,
        name: 'פניות בוואטסאפ',
        total: analytics.interactions.whatsapp.total,
        unique: analytics.interactions.whatsapp.unique,
        icon: <FaWhatsapp className="h-6 w-6 text-green-500" />,
        color: 'bg-green-50'
      },
      {
        id: 3,
        name: 'פניות במייל',
        total: analytics.interactions.email.total,
        unique: analytics.interactions.email.unique,
        icon: <FaEnvelope className="h-6 w-6 text-purple-500" />,
        color: 'bg-purple-50'
      },
      {
        id: 4,
        name: 'שיחות טלפון',
        total: analytics.interactions.phone.total,
        unique: analytics.interactions.phone.unique,
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
          {stats.map((item) => (
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
                <p className="text-sm text-gray-500">
                  {item.unique} ייחודי
                </p>
              </dd>
            </div>
          ))}
        </div>

        <div className="mt-8">
          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">פעולות מהירות</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="dashboard/properties/new" className="inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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

              {/* <Link href="/analytics" className="inline-flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                <FaChartBar className="h-5 w-5 ml-2" />
                סטטיסטיקות מפורטות
              </Link> */}

              {/* <Link href="/messages" className="inline-flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <FaEnvelope className="h-5 w-5 ml-2" />
                הודעות וצ'אט
              </Link> */}

              {/* <Link href="/settings" className="inline-flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <FaCog className="h-5 w-5 ml-2" />
                הגדרות מערכת
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in DashboardPage:', error);
    return null;
  }
}