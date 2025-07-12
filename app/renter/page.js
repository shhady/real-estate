import Link from 'next/link';
import { FaCalculator, FaSearch, FaHome, FaFileContract, FaKey, FaHandshake, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const steps = [
  {
    id: 1,
    title: "הכנה ראשונית והגדרת תקציב",
    icon: <FaCalculator className="h-8 w-8" />,
    description: "הגדרת תקציב, צרכים אישיים והכנה לתהליך השכירות"
  },
  {
    id: 2,
    title: "חיפוש דירה וקביעת קריטריונים",
    icon: <FaSearch className="h-8 w-8" />,
    description: "חיפוש יעיל בפלטפורמות, סינון והכנה לביקורים"
  },
  {
    id: 3,
    title: "ביקור בדירות ופגישה עם המשכיר",
    icon: <FaHome className="h-8 w-8" />,
    description: "בדיקת הדירה, שאלות נכונות והתרשמות מהמשכיר"
  },
  {
    id: 4,
    title: "בדיקות משפטיות והכנה לחוזה",
    icon: <FaFileContract className="h-8 w-8" />,
    description: "הבנת זכויות וחובות, בדיקת תנאי החוזה ונושא הביטחונות"
  },
  {
    id: 5,
    title: "חתימת חוזה השכירות",
    icon: <FaKey className="h-8 w-8" />,
    description: "תהליך החתימה, תשלומים ראשוניים וקבלת המפתחות"
  },
  {
    id: 6,
    title: "מעבר לדירה ותקופת השכירות",
    icon: <FaHandshake className="h-8 w-8" />,
    description: "מעבר לדירה, שמירה על הזכויות ותחזוקה שוטפת"
  }
];

export default function RenterIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaKey className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              מדריך שוכר דירה
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
              מדריך מקיף לכל שוכר דירה - מהכנה לחיפוש ועד תקופת השכירות
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/"
          className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors"
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
                href={`/renter/${step.id}`}
                className="group p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <div className="text-purple-600">
                        {step.icon}
                      </div>
                    </div>
                  </div>
                  <div className="mr-4 flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        שלב {step.id}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
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
              href="/renter/faq"
              className="inline-flex items-center px-6 py-3 border border-purple-300 rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors text-lg font-medium"
            >
              שאלות נפוצות על שכירת דירה
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 