import Hero from './components/home/Hero';
import PropertyCard from './components/ui/PropertyCard';
import { FaHome, FaSearch, FaUserTie, FaHandshake } from 'react-icons/fa';
import connectDB from '@/app/lib/mongodb';
import Property from '@/app/models/Property';
import User from '@/app/models/User';

async function getLatestProperties() {
  try {
    await connectDB();
    
    const properties = await Property.find({ approved: true })
      .populate({
        path: 'user',
        model: User,
        select: 'fullName email phone'
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Convert _id to string and sanitize data
    return properties.map(property => ({
      ...property,
      _id: property._id.toString(),
      user: {
        ...property.user,
        _id: property.user._id.toString()
      }
    }));
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return [];
  }
}

export default async function Home() {
  const latestProperties = await getLatestProperties();

  const features = [
    {
      icon: <FaHome className="h-8 w-8 text-blue-600" />,
      title: 'מגוון נכסים',
      description: 'עיין במבחר הרחב של נכסי מגורים ומסחר שלנו.'
    },
    {
      icon: <FaSearch className="h-8 w-8 text-blue-600" />,
      title: 'חיפוש חכם',
      description: 'מצא את הנכס האידיאלי עם מערכת החיפוש והסינון המתקדמת שלנו.'
    },
    {
      icon: <FaUserTie className="h-8 w-8 text-blue-600" />,
      title: 'סוכנים מומחים',
      description: 'התחבר לסוכני נדל"ן מנוסים שילוו אותך לאורך כל התהליך.'
    },
    {
      icon: <FaHandshake className="h-8 w-8 text-blue-600" />,
      title: 'שירות אמין',
      description: 'אנו מבטיחים שירות שקוף ואמין לאורך כל מסע הנדל"ן שלך.'
    }
  ];

  return (
    <div>
      <Hero />

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">למה לבחור בנו</h2>
            <p className="mt-4 text-xl text-gray-600">
              אנו מספקים שירותי נדל"ן מקיפים המותאמים לצרכים שלך
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Properties */}
      <section className="py-16 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">נכסים חדשים</h2>
            <p className="mt-4 text-xl text-gray-600">
              הנכסים האחרונים שנוספו לפלטפורמה שלנו
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {latestProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>

          {latestProperties.length > 0 && (
            <div className="mt-12 text-center">
              <a
                href="/properties"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                צפה בכל הנכסים
              </a>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            מוכן למצוא את בית חלומותיך?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            הצטרף לאלפי לקוחות מרוצים שמצאו את הנכס המושלם שלהם איתנו
          </p>
          <div className="mt-8">
            <a
              href="/properties"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
            >
              התחל לחפש
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
