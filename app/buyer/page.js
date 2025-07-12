import Link from 'next/link';
import { FaCalculator, FaUniversity, FaSearch, FaHome, FaGavel, FaFileContract, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const steps = [
  {
    id: 1,
    title: "הכנה פיננסית ובדיקת כושר אשראי",
    icon: <FaCalculator className="h-8 w-8" />,
    description: "הערכת יכולת המימון האישית והכנת המסמכים הפיננסיים"
  },
  {
    id: 2,
    title: "קבלת אישור עקרוני למשכנתא",
    icon: <FaUniversity className="h-8 w-8" />,
    description: "פנייה לבנק, בדיקת יכולת החזר וקבלת אישור למשכנתא"
  },
  {
    id: 3,
    title: "חיפוש דירה והגדרת קריטריונים",
    icon: <FaSearch className="h-8 w-8" />,
    description: "הגדרת דרישות, תקציב ומיקום, וחיפוש דירה בפלטפורמות השונות"
  },
  {
    id: 4,
    title: "ביקור בדירות ובדיקות מעמיקות",
    icon: <FaHome className="h-8 w-8" />,
    description: "ביקור בדירות, בדיקת מצב פיזי ובדיקות משפטיות ראשוניות"
  },
  {
    id: 5,
    title: "עבודה עם עורך דין ובדיקות משפטיות",
    icon: <FaGavel className="h-8 w-8" />,
    description: "חשיבות עורך דין מומחה במקרקעין ותהליך הבדיקות המשפטיות"
  },
  {
    id: 6,
    title: "חתימת חוזה והשלמת העסקה",
    icon: <FaFileContract className="h-8 w-8" />,
    description: "תהליך חתימת החוזה, העברת כספים והשלמת רכישת הדירה"
  }
];

export default function BuyerIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaSearch className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              מדריך קונה דירה
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              מדריך מקיף לכל קונה דירה - מההכנה הפיננסית ועד השלמת העסקה
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/"
          className="inline-flex items-center text-green-600 hover:text-green-800 transition-colors"
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
                href={`/buyer/${step.id}`}
                className="group p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <div className="text-green-600">
                        {step.icon}
                      </div>
                    </div>
                  </div>
                  <div className="mr-4 flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                        שלב {step.id}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
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
              href="/buyer/faq"
              className="inline-flex items-center px-6 py-3 border border-green-300 rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition-colors text-lg font-medium"
            >
              שאלות נפוצות על רכישת דירה
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 