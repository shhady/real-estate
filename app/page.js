import Hero from './components/home/Hero';
import PropertyCard from './components/ui/PropertyCard';
import { FaHome, FaSearch, FaUserTie, FaHandshake } from 'react-icons/fa';
import { Suspense } from 'react';
import Link from 'next/link';
import connectDB from './lib/mongodb';
import Property from './models/Property';
import User from './models/User';
export const dynamic = 'force-dynamic';

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
      .limit(8)
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
      <Suspense fallback={<div className="h-[600px] bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">טוען...</p>
        </div>
      </div>}>
        <Hero />
      </Suspense>

      {/* User Guide Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">מה חשוב לדעת</h2>
            <p className="mt-4 text-xl text-gray-600">
              מידע חיוני לכל סוג משתמש בשוק הנדל"ן
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Seller Guide */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-blue-100">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <FaHome className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center ">
                מוכר
              </h3>
              <ul className="mt-3 text-sm text-gray-600 space-y-2">
                <li>• קבע מחיר הוגן לפי שוק</li>
                <li>• הכן תמונות איכותיות</li>
                <li>• וודא מסמכים חוקיים</li>
                <li>• בחר סוכן מנוסה</li>
                <li>• השקע בהכנה לצפייה</li>
              </ul>
              <div className="mt-4 text-center">
                <Link href="/seller" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                  קרא עוד
                </Link>
              </div>
            </div>

            {/* Buyer Guide */}
            <div className="bg-green-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-green-100">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <FaSearch className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">
                קונה
              </h3>
              <ul className="mt-3 text-sm text-gray-600 space-y-2">
                <li>• קבע תקציב ומקורות מימון</li>
                <li>• בדוק מחירי שוק באזור</li>
                <li>• בצע בדיקת עורך דין</li>
                <li>• בדוק תשתיות ומצב הנכס</li>
                <li>• השווה כמה אפשרויות</li>
              </ul>
              <div className="mt-4 text-center">
                <Link href="/buyer" className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors">
                  קרא עוד
                </Link>
              </div>
            </div>

            {/* Renter Guide */}
            <div className="bg-purple-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-purple-100">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <FaUserTie className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">
                שוכר
              </h3>
              <ul className="mt-3 text-sm text-gray-600 space-y-2">
                <li>• בדוק הכנסה לעומת שכירות</li>
                <li>• קרא בעיון את חוזה השכירות</li>
                <li>• בדוק מצב הדירה בקפדנות</li>
                <li>• ברר על דמי ועד/ארנונה</li>
                <li>• הכן ערבויות נדרשות</li>
              </ul>
              <div className="mt-4 text-center">
                <Link href="/renter" className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors">
                  קרא עוד
                </Link>
              </div>
            </div>

            {/* Landlord Guide */}
            <div className="bg-orange-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-orange-100">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <FaHandshake className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">
                משכיר
              </h3>
              <ul className="mt-3 text-sm text-gray-600 space-y-2">
                <li>• בדוק רקע פיננסי של שוכר</li>
                <li>• הכן חוזה שכירות מפורט</li>
                <li>• קבע דמי שכירות הוגנים</li>
                <li>• ודא ביטוח נכס מתאים</li>
                <li>• החזק את הנכס במצב טוב</li>
              </ul>
              <div className="mt-4 text-center">
                <Link href="/landlord" className="text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors">
                  קרא עוד
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                <div className="flex justify-center text-[#08171f]">{feature.icon}</div>
                <h3 className="mt-4 text-lg font-medium text-[#08171f] text-center">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[#08171f] text-center">{feature.description}</p>
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
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#08171f] hover:bg-[#F6F6F6] hover:text-[#08171f] transition-colors"
              >
                צפה בכל הנכסים
              </a>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#F6F6F6] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#08171f]">
            מוכן למצוא את בית חלומותיך?
          </h2>
          <p className="mt-4 text-xl text-[#08171f]">
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
