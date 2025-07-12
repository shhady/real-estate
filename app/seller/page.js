import Link from 'next/link';
import { FaHome, FaDollarSign, FaCamera, FaSearch, FaHandshake, FaFileContract, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const steps = [
  {
    id: 1,
    title: "הכנה משפטית ורישומית",
    icon: <FaHome className="h-8 w-8" />,
    description: "בדיקת המצב המשפטי של הדירה והכנת המסמכים הנדרשים"
  },
  {
    id: 2,
    title: "קביעת מחיר נכון",
    icon: <FaDollarSign className="h-8 w-8" />,
    description: "איך לדעת מהו המחיר הנכון למכור את הדירה"
  },
  {
    id: 3,
    title: "פרסום הדירה",
    icon: <FaCamera className="h-8 w-8" />,
    description: "איך לפרסם את הדירה ולמצוא קונים בפלטפורמות השונות"
  },
  {
    id: 4,
    title: "ניהול פגישות וסיורים",
    icon: <FaSearch className="h-8 w-8" />,
    description: "איך לקבוע פגישות עם קונים ולהציג את הדירה בצורה מקצועית"
  },
  {
    id: 5,
    title: "משא ומתן על מחיר",
    icon: <FaHandshake className="h-8 w-8" />,
    description: "איך לנהל משא ומתן עם קונים על המחיר תוך שמירה על מקצועיות"
  },
  {
    id: 6,
    title: "חתימת חוזה ועורך דין",
    icon: <FaFileContract className="h-8 w-8" />,
    description: "מה תפקידו של עורך הדין בעת חתימת חוזה מכירת דירה"
  }
];

export default function SellerIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaHome className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              מדריך מוכר דירה
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              מדריך מקיף לכל מוכר דירה - מההכנה הראשונית ועד חתימת החוזה
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
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
                href={`/seller/${step.id}`}
                className="group p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <div className="text-blue-600">
                        {step.icon}
                      </div>
                    </div>
                  </div>
                  <div className="mr-4 flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        שלב {step.id}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
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
              href="/seller/faq"
              className="inline-flex items-center px-6 py-3 border border-blue-300 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors text-lg font-medium"
            >
              שאלות נפוצות על מכירת דירה
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 