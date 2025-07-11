// 'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaGavel, FaDollarSign, FaBullhorn, FaFileContract, FaCog, FaArrowCircleLeft, FaArrowCircleRight, FaCheckCircle, FaClock, FaQuestionCircle } from 'react-icons/fa';

// מידע השלבים
const steps = {
  1: {
    title: "הכנות ראשוניות לפני השכרת הדירה",
    icon: <FaHome className="h-8 w-8" />,
    description: "הכנת הדירה, הסכמי שכירות וביטוחים",
    content: {
      intro: "לפני שמפרסם את הדירה להשכרה, חשוב מאוד לוודא שהדירה מוכנה להשכרה, שתקבל את המחיר הנכון ושהכל ייעשה בצורה חוקית.",
      sections: [
        {
          title: "הכנת הדירה להשכרה",
          content: [
            "תיקונים ושיפוצים: וודא שהדירה במצב טוב. כל תיקון קטן, כמו נזילה, צנרת לא תקינה או בעיות חשמל, צריך להיות מטופל לפני הפרסום.",
            "נקיון וסידור הדירה: הדירה צריכה להיות נקיה ומסודרת. זה כולל חידוש צבעים במידת הצורך, סידור הרהיטים, ודאגה למרפסת או חצר.",
            "בדיקת תשתיות: וודא שהתשתיות בדירה תקינות - מערכות החשמל, המים והגז. כל בעיה בתחום הזה עלולה לגרום לבעיות בהמשך."
          ]
        },
        {
          title: "עריכת הסכם השכירות",
          content: [
            "הסכם בכתב: תמיד יש להכין הסכם בכתב, גם אם השכירות נעשית עם חברים או בני משפחה. הסכם כתוב מבטיח שלשני הצדדים יש הבנה ברורה.",
            "פרטים חשובים: בהסכם יפורטו כל תנאי השכירות - גובה דמי השכירות, תקופת השכירות, מועדי תשלום, סכום הפיקדון.",
            "התחייבויות השוכר: יש לפרט את התחייבויות השוכר כמו תחזוקה שוטפת של הדירה, תשלום חשבונות, ושמירה על הנכס."
          ]
        }
      ],
      summary: "השלב הראשון קריטי להצלחת השכירות. הכנה טובה וחוזה ברור יחסכו בעיות רבות בהמשך."
    }
  },
  2: {
    title: "בדיקות משפטיות ורגולטוריות",
    icon: <FaGavel className="h-8 w-8" />,
    description: "ביטוחים, היתרים ובדיקות משפטיות",
    content: {
      intro: "ישנן כמה בדיקות משפטיות ורגולטוריות שצריך לבצע לפני השכרת הדירה כדי להבטח שהכל יתנהל בצורה חוקית.",
      sections: [
        {
          title: "תיאום עם רשויות מקומיות",
          content: [
            "רישום בעירייה: בדוק עם העירייה המקומית אם יש כל מגבלה או רגולציה שמחייבת רישום הדירה להשכרה.",
            "בדיקת הגבלות: אם מדובר בשכירות קצרת מועד או דיירי משנה, בדוק את ההגבלות העירוניות בתחום זה.",
            "חובות קיימים: וודא שאין חובות על הדירה כמו ארנונה, חשמל, מים, וועד בית."
          ]
        },
        {
          title: "ביטוח דירה",
          content: [
            "ביטוח מבנה: חשוב להיות מבוטח עם פוליסת ביטוח לדירה ולבדוק שהיא מכסה נזקים שיכולים להיגרם על ידי השוכר.",
            "ביטוח שוכרים: אפשר לבקש מהשוכר להוציא ביטוח שוכרים שיכסה נזקים שיכולים להיגרם למבנה או לחפצים.",
            "כיסוי מקיף: וודא שהביטוח מכסה נזקי מים, פריצה, ואחריות כלפי צד שלישי."
          ]
        },
        {
          title: "בדיקת היתרי בנייה",
          content: [
            "תקינות משפטית: וודא שהדירה עומדת בכל דרישות הרגולציה המקומית ושאין חריגות בנייה שלא אושרו.",
            "מסמכים נדרשים: בדוק שיש לך את כל המסמכים הרלוונטיים לגבי הדירה ומצבה המשפטי."
          ]
        }
      ],
      summary: "בדיקות משפטיות וביטוח מתאים חיוניים להגנה על המשכיר ולהבטחת שכירות חוקית ובטוחה."
    }
  },
  3: {
    title: "תמחור הדירה",
    icon: <FaDollarSign className="h-8 w-8" />,
    description: "קביעת מחיר שכירות הוגן ותחרותי",
    content: {
      intro: "לפני שמפרסם את הדירה להשכרה, עליך לדעת את המחיר שאתה רוצה לקבל, שיתאם למצב השוק ולתנאי הדירה.",
      sections: [
        {
          title: "מחקר שוק",
          content: [
            "בדיקת מחירים באזור: בדוק כמה דירות דומות להשכרה באזור שלך. השתמש באתרים כמו יד2, מדד להשוואת מחירים.",
            "גורמים משפיעים: מחיר השכירות תלוי במיקום, גודל הדירה, מצב הדירה, קומה, חנייה, ריהוט, קרבה לתחבורה ושירותים.",
            "ניתוח תחרות: בדוק כמה דירות דומות יש באזור ומה רמת הביקוש."
          ]
        },
        {
          title: "קביעת דמי השכירות",
          content: [
            "מחיר סביר: קבע מחיר שיתאים לשוק המקומי ויכסה את הוצאותיך, תוך שמירה על יתרון תחרותי.",
            "כיסוי הוצאות: חשב את הוצאות הבעלות החודשיות כולל ארנונה, וועד בית, ביטוח ותחזוקה.",
            "מרווח למשא ומתן: השאר מקום למשא ומתן עם שוכרים פוטנציאליים."
          ]
        },
        {
          title: "הוצאות נוספות",
          content: [
            "חלוקת הוצאות: החלט מי יהיה אחראי על תשלום חשמל, מים, ארנונה, גז ואינטרנט.",
            "שקיפות: הבהר לשוכרים הפוטנציאליים מה כלול במחיר השכירות ומה הם יצטרכו לשלם בנפרד."
          ]
        }
      ],
      summary: "קביעת מחיר נכון חשובה להצלחת השכירות. מחקר שוק יסודי ומחיר הוגן ימשכו שוכרים איכותיים."
    }
  },
  4: {
    title: "פרסום הדירה להשכרה",
    icon: <FaBullhorn className="h-8 w-8" />,
    description: "שיווק הדירה ומציאת שוכר מתאים",
    content: {
      intro: "לאחר שהדירה מוכנה, יש להציג אותה לשוכרים פוטנציאליים. ישנם מספר כלים שבהם ניתן להשתמש כדי לפרסם את הדירה.",
      sections: [
        {
          title: "פלטפורמות פרסום באינטרנט",
          content: [
            "אתרי נדל\"ן: יד2, מדד, הומלס, אולx - האתרים המובילים לפרסום דירות להשכרה בישראל.",
            "צילום מקצועי: הוצא תמונות טובות של הדירה שיציגו אותה במיטבה. תמונות טובות יכולות להגדיל משמעותית את הסיכוי למצוא שוכר מתאים.",
            "תיאור מפורט: פרט את כל היתרונות - גודל, מספר חדרים, ריהוט, שירותים נוספים, מיקום ותחבורה."
          ]
        },
        {
          title: "שיווק נוסף",
          content: [
            "רשתות חברתיות: פרסם בקבוצות פייסבוק של דירות להשכרה, קבוצות מקומיות ואינסטגרם.",
            "פרסום מסורתי: עיתונות מקומית, לוחות מודעות בשכונה, המלצות מחברים ומכרים.",
            "סוכני נדל\"ן: שקול עבודה עם סוכן נדל\"ן מקומי שיכול לעזור במציאת שוכרים."
          ]
        },
        {
          title: "סינון שוכרים",
          content: [
            "ראיון ראשוני: בצע ראיון טלפוני לבדיקת יציבות תעסוקתית, הכנסות, ומספר דיירים צפוי.",
            "מסמכים נדרשים: בקש תלושי שכר, אישור מעסיק, המלצות מבעלי בית קודמים.",
            "ערבויות: דרוש פיקדון (1-2 חודשי שכירות) וערבות בנקאית או ערב אישי במידת הצורך."
          ]
        }
      ],
      summary: "פרסום מוצלח דורש תמונות איכותיות, תיאור מפורט, ופרסום בפלטפורמות הנכונות. סינון שוכרים חשוב למציאת שוכר אמין."
    }
  },
  5: {
    title: "חתימה על הסכם השכירות",
    icon: <FaFileContract className="h-8 w-8" />,
    description: "גיבוש ההסכם הסופי וחתימה",
    content: {
      intro: "לאחר שמצאת שוכר, צריך להגיע לחתימה על הסכם השכירות. זהו שלב קריטי שקובע את כל התנאים בין הצדדים.",
      sections: [
        {
          title: "הסכם שכירות מפורט",
          content: [
            "פרטי הצדדים: שם מלא ות.ז. של המשכיר והשוכר, כתובות מלאות, מספרי טלפון וכתובות מייל.",
            "תנאי השכירות: גובה דמי השכירות, מועד תשלום, תקופת השכירות, סכום הפיקדון ותנאי החזרתו.",
            "אחריות והתחייבויות: פרט את חובות השוכר לגבי תחזוקה, שמירה על הנכס, איסורים ומגבלות."
          ]
        },
        {
          title: "סעיפים מיוחדים",
          content: [
            "מדיניות חיות מחמד: קבע מדיניות ברורה לגבי חיות מחמד בדירה.",
            "שעות שקט: הגדר כללים לגבי רעש ושעות שקט בבניין.",
            "זכויות כניסה: הגדר תנאים לכניסה של המשכיר לדירה עם הודעה מוקדמת."
          ]
        },
        {
          title: "חתימה וביצוע",
          content: [
            "קריאה משותפת: קרא את ההסכם יחד עם השוכר לפני החתימה והבהר כל סעיף.",
            "חתימה על כל דף: וודא שכל דף של ההסכם חתום על ידי שני הצדדים.",
            "קבלת הפיקדון: קבל את הפיקדון והוצא קבלה מפורטת. הפקד את הפיקדון בנפרד."
          ]
        }
      ],
      summary: "הסכם שכירות מפורט וחתימה נכונה הם בסיס לשכירות מוצלחת. חשוב לוודא שכל הסעיפים ברורים ומוסכמים."
    }
  },
  6: {
    title: "ניהול השכירות במהלך התקופה",
    icon: <FaCog className="h-8 w-8" />,
    description: "ניהול יומיומי ויחסי שוכר-משכיר",
    content: {
      intro: "לאחר שהשוכר נכנס לדירה, יש לנהל את השכירות בצורה מקצועית ומסודרת כדי להבטיח שהתקופה תעבור בשלום.",
      sections: [
        {
          title: "מעקב אחר תשלומים",
          content: [
            "גביית שכירות: וודא שהתשלומים מתבצעים בזמן ושהשוכר עומד בהתחייבויותיו.",
            "רישום תשלומים: רשום מדויק של כל התשלומים והוצא קבלות במידת הצורך.",
            "טיפול באיחורים: התראה ראשונה אחרי 3-5 ימים, התראה שנייה אחרי 10 ימים, התראה סופית אחרי 15 ימים."
          ]
        },
        {
          title: "תחזוקה ותיקונים",
          content: [
            "תיקונים שוטפים: היה זמין לקבלת קריאות תחזוקה והבחן בין תיקונים באחריות המשכיר והשוכר.",
            "תיקונים דחופים: טפל מהיר בבעיות דחופות כמו מים, חשמל, ובטיחות.",
            "בדיקות תקופתיות: בקר בדירה מדי פעם (בתיאום עם השוכר) לבדיקת מצב ותחזוקה."
          ]
        },
        {
          title: "תקשורת עם השוכר",
          content: [
            "זמינות: היה זמין לשאלות ובעיות והקשב לתלונות השוכר.",
            "כבוד הדדי: שמור על יחסי כבוד עם השוכר והודע מראש לפני כניסה לדירה.",
            "פתרון בעיות: חפש פתרונות Win-Win לבעיות ותעד שיחות חשובות."
          ]
        },
        {
          title: "סיום השכירות",
          content: [
            "הודעה מוקדמת: תן או קבל הודעה מוקדמת על סיום השכירות לפי ההסכם.",
            "בדיקת מצב: בדוק את מצב הדירה יחד עם השוכר והערך נזקים מעבר לבלאי רגיל.",
            "החזרת פיקדון: החזר את הפיקדון תוך 30 יום לאחר ניכוי הוצאות מוצדקות."
          ]
        }
      ],
      summary: "ניהול מקצועי של השכירות כולל מעקב אחר תשלומים, תחזוקה שוטפת, תקשורת טובה עם השוכר, וטיפול נכון בסיום השכירות."
    }
  }
};

export default async function LandlordGuidePage({ params }) {
  const { id } = await params;
  const stepNumber = parseInt(id);
  
  if (!steps[stepNumber]) {
    notFound();
  }
  
  const currentStep = steps[stepNumber];
  const prevStep = stepNumber > 1 ? stepNumber - 1 : null;
  const nextStep = stepNumber < 6 ? stepNumber + 1 : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {currentStep.icon}
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              שלב {stepNumber}: {currentStep.title}
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              {currentStep.description}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              התקדמות: שלב {stepNumber} מתוך 6
            </span>
            <div className="flex-1 mx-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stepNumber / 6) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-500">
                {Math.round((stepNumber / 6) * 100)}%
              </span>
              <Link
                href="/landlord/faq"
                className="inline-flex items-center px-3 py-1.5 border border-green-300 rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition-colors text-sm"
              >
                <FaQuestionCircle className="h-4 w-4 ml-1" />
                שאלות נפוצות
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8" dir="rtl">
          {/* Introduction */}
          <div className="mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              {currentStep.content.intro}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {currentStep.content.sections.map((section, index) => (
              <div key={index} className="border-r-4 border-orange-500 pr-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start">
                      <FaCheckCircle className="h-5 w-5 text-orange-500 mt-0.5 ml-3 flex-shrink-0" />
                      <p className="text-gray-700 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-8 p-6 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center">
              <FaClock className="h-5 w-5 ml-2" />
              סיכום השלב
            </h3>
            <p className="text-orange-800 leading-relaxed">
              {currentStep.content.summary}
            </p>
          </div>
        </div>

        {/* Navigation */}
        {/* Desktop Navigation */}
        <div className="mt-8 hidden sm:flex justify-between items-center">
          <div>
            {prevStep && (
              <Link
                href={`/landlord/${prevStep}`}
                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <FaArrowCircleRight className="h-5 w-5 ml-2" />
                שלב קודם
              </Link>
            )}
          </div>
          
          <div className="flex space-x-2 space-x-reverse">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <Link
                key={step}
                href={`/landlord/${step}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === stepNumber
                    ? 'bg-orange-600 text-white'
                    : step < stepNumber
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {step < stepNumber ? <FaCheckCircle className="h-4 w-4" /> : step}
              </Link>
            ))}
          </div>

          <div>
            {nextStep ? (
              <Link
                href={`/landlord/${nextStep}`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                שלב הבא
                <FaArrowCircleLeft className="h-5 w-5 mr-2" />
              </Link>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center px-6 py-3 border border-green-200 rounded-md text-green-800 bg-green-50">
                  <FaCheckCircle className="h-5 w-5 ml-2 text-green-600" />
                  סיימת את המדריך בהצלחה!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="mt-8 sm:hidden">
          {/* Progress circles */}
          <div className="flex justify-center space-x-2 space-x-reverse mb-6">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <Link
                key={step}
                href={`/landlord/${step}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === stepNumber
                    ? 'bg-orange-600 text-white'
                    : step < stepNumber
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {step < stepNumber ? <FaCheckCircle className="h-4 w-4" /> : step}
              </Link>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <div>
              {prevStep && (
                <Link
                  href={`/landlord/${prevStep}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <FaArrowCircleRight className="h-4 w-4 ml-2" />
                  שלב קודם
                </Link>
              )}
            </div>

            <div>
              {nextStep ? (
                <Link
                  href={`/landlord/${nextStep}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                >
                  שלב הבא
                  <FaArrowCircleLeft className="h-4 w-4 mr-2" />
                </Link>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 border border-green-200 rounded-md text-green-800 bg-green-50 text-sm">
                    <FaCheckCircle className="h-4 w-4 ml-2 text-green-600" />
                    סיימת בהצלחה!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 