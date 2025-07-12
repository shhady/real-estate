import Link from 'next/link';
import { FaHome, FaGavel, FaDollarSign, FaBullhorn, FaFileContract, FaCog, FaArrowLeft } from 'react-icons/fa';

const steps = [
  {
    id: 1,
    title: "הכנות ראשוניות לפני השכרת הדירה",
    icon: <FaHome className="h-8 w-8" />,
    description: "הכנת הדירה, הסכמי שכירות וביטוחים"
  },
  {
    id: 2,
    title: "בדיקות משפטיות ורגולטוריות",
    icon: <FaGavel className="h-8 w-8" />,
    description: "ביטוחים, היתרים ובדיקות משפטיות"
  },
  {
    id: 3,
    title: "תמחור הדירה",
    icon: <FaDollarSign className="h-8 w-8" />,
    description: "קביעת מחיר שכירות הוגן ותחרותי"
  },
  {
    id: 4,
    title: "פרסום הדירה להשכרה",
    icon: <FaBullhorn className="h-8 w-8" />,
    description: "שיווק הדירה ומציאת שוכר מתאים"
  },
  {
    id: 5,
    title: "חתימה על הסכם השכירות",
    icon: <FaFileContract className="h-8 w-8" />,
    description: "גיבוש ההסכם הסופי וחתימה"
  },
  {
    id: 6,
    title: "ניהול השכירות במהלך התקופה",
    icon: <FaCog className="h-8 w-8" />,
    description: "ניהול יומיומי ויחסי שוכר-משכיר"
  }
];

export default function LandlordIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaHome className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              מדריך משכיר דירה
            </h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
              מדריך מקיף לכל משכיר דירה - מהכנה לפרסום ועד ניהול השכירות
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/"
          className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors"
        >
          <FaArrowRight className="h-4 w-4 ml-2" />
          חזור לדף הבית
        </Link>
      </div>

      {/* Steps Index */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-lg shadow-lg p-8" dir="rtl">
          <div className="text-center mb-12">
            
            <p className="text-gray-600 text-lg">
              לחץ על כל שלב כדי לעבור למידע המפורט
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step) => (
              <Link
                key={step.id}
                href={`/landlord/${step.id}`}
                className="group p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-orange-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <div className="text-orange-600">
                        {step.icon}
                      </div>
                    </div>
                  </div>
                  <div className="mr-4 flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        שלב {step.id}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* FAQ Link */}
          <div className="mt-12 text-center">
            <Link
              href="/landlord/faq"
              className="inline-flex items-center px-6 py-3 border border-orange-300 rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors text-lg font-medium"
            >
              שאלות נפוצות על השכרת דירה
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 