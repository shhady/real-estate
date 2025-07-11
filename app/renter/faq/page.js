import Link from 'next/link';
import { FaQuestionCircle, FaHome, FaArrowLeft } from 'react-icons/fa';

const faqData = [
  {
    category: "תקציב ומימון",
    questions: [
      {
        question: "כמה אחוזים מההכנסה כדאי להקצות לשכר דירה?",
        answer: "ההמלצה היא לא יותר מ-30%-40% מההכנסה החודשית נטו. זה מותיר מקום להוצאות אחרות כמו אוכל, ביגוד, בילויים וחיסכון לחירום."
      },
      {
        question: "מה זה פיקדון וכמה הוא בדרך כלל?",
        answer: "הפיקדון הוא סכום שמשלמים למשכיר כביטחון על עמידה בתנאי החוזה. בדרך כלל הוא 1-2 חודשי שכירות. הוא מוחזר בסיום השכירות אם לא נגרמו נזקים או אין חובות."
      },
      {
        question: "מה ההוצאות הנוספות מעבר לשכר הדירה?",
        answer: "הוצאות נוספות כוללות: ארנונה (200-800 ש\"ח), חשמל (100-400 ש\"ח), מים (50-150 ש\"ח), אינטרנט (100-200 ש\"ח), ועד בית (50-300 ש\"ח). בסך הכל 15%-25% נוספים על שכר הדירה."
      },
      {
        question: "מתי אני משלם את הפיקדון?",
        answer: "הפיקדון משולם בדרך כלל בחתימת החוזה, יחד עם החודש הראשון. חשוב לקבל קבלה על התשלום ולוודא שהוא מופקד בחשבון נפרד ולא בחשבון האישי של המשכיר."
      }
    ]
  },
  {
    category: "חיפוש וביקור בדירות",
    questions: [
      {
        question: "איפה הכי טוב לחפש דירות להשכרה?",
        answer: "המקומות הטובים ביותר: יד2 (הפלטפורמה הגדולה), פייסבוק מרקטפלייס וקבוצות מקומיות, מדלן, אפליקציות כמו HomeDash, ולוחות מודעות פיזיים בשכונות."
      },
      {
        question: "על מה חשוב לשאול בביקור בדירה?",
        answer: "שאל על: מה כלול בשכירות (חשמל, מים, ארנונה), גובה הפיקדון, מדיניות תיקונים, הגבלות על שימוש, מתי אפשר להיכנס, והאם יש בעיות עם השכנים או הבניין."
      },
      {
        question: "איך אני יודע שהדירה במצב טוב?",
        answer: "בדוק: כל הברזים והמתגים עובדים, אין רטיבות או סדקים בקירות, חלונות ודלתות נסגרים היטב, מערכת חימום/מיזוג פועלת, ומצב הריהוט והמכשירים (אם מרוהט)."
      },
      {
        question: "כמה דירות כדאי לראות לפני החלטה?",
        answer: "מומלץ לראות לפחות 3-5 דירות כדי לקבל הרגשה לשוק ולמחירים. אל תמהר להחליט על הדירה הראשונה, אבל גם אל תחכה יותר מדי - דירות טובות נתפסות מהר."
      }
    ]
  },
  {
    category: "היבטים משפטיים וחוזה",
    questions: [
      {
        question: "מה חשוב לבדוק בחוזה השכירות?",
        answer: "ודא שמופיעים: גובה השכירות ומועדי תשלום, תקופת השכירות, אחריות לתיקונים, תנאי סיום החוזה, הגבלות על שימוש, ופרטי הצדדים המלאים. כל הסכמה בעל פה צריכה להיות כתובה."
      },
      {
        question: "מה הזכויות שלי כשוכר?",
        answer: "זכותך לדירה ראויה למגורים, לפרטיות (המשכיר לא יכול להיכנס ללא תיאום), להודעה מוקדמת על סיום חוזה או העלאת שכירות, ולקבל את הפיקדון בחזרה אם לא גרמת נזקים."
      },
      {
        question: "מי אחראי על תיקונים בדירה?",
        answer: "בדרך כלל: המשכיר אחראי על תיקונים מבניים, מכשירי חשמל שהיו בדירה, ובעיות תשתית. השוכר אחראי על נזקים שגרם, ברגע ובלאי רגיל. הכל צריך להיות ברור בחוזה."
      },
      {
        question: "מה קורה אם רוצה לעזוב לפני סיום החוזה?",
        answer: "זה תלוי בתנאי החוזה. בדרך כלל צריך לתת הודעה מוקדמת (30 יום) ולשלם פיצוי. חשוב לבדוק את הסעיף הזה בחוזה לפני החתימה ולנסות לנגוע על תנאים הוגנים."
      }
    ]
  },
  {
    category: "תחזוקה ויחסים עם המשכיר",
    questions: [
      {
        question: "מה עושים אם המשכיר לא מתקן תקלות?",
        answer: "דווח בכתב (מייל או SMS), שמור תיעוד של הדיווח. אם זה חירום - תקן ושמור קבלות לתיחוב. אם המשכיר לא מגיב, פנה לייעוץ משפטי או לעמותות זכויות השוכר."
      },
      {
        question: "האם מותר לי לעשות שינויים בדירה?",
        answer: "רק עם אישור בכתב מהמשכיר. שינויים קטנים כמו תליית תמונות בדרך כלל מותרים, אבל צביעה, החלפת ריצוף או שינויים מבניים דורשים אישור מפורש."
      },
      {
        question: "איך שומרים על יחסים טובים עם המשכיר?",
        answer: "שלם בזמן, דווח על בעיות מיידית, שמור על הדירה נקייה, תקשר בצורה מנומסת ומקצועית, וכבד את תנאי החוזה. יחסים טובים יעזרו בעת בעיות או רצון להאריך חוזה."
      },
      {
        question: "מה עושים אם יש בעיות עם שכנים?",
        answer: "נסה לפתור בשיחה אישית קודם. אם זה לא עוזר, דווח למשכיר או לועד הבית. תעד תלונות (שעות, סוג הרעש). במקרים קיצוניים אפשר לפנות למשטרה או לועדת ערר."
      }
    ]
  },
  {
    category: "סיום שכירות והחזרת פיקדון",
    questions: [
      {
        question: "איך מוודים שאקבל את הפיקדון בחזרה?",
        answer: "תעד את מצב הדירה בכניסה (צילומים + רשימה), שמור על הדירה במצב טוב, תקן נזקים שגרמת, נקה היטב לפני היציאה, והזמן את המשכיר לבדיקה סופית יחד איתך."
      },
      {
        question: "כמה זמן יש למשכיר להחזיר את הפיקדון?",
        answer: "לפי חוק הגנת הדייר, המשכיר חייב להחזיר את הפיקדון תוך 14 יום מסיום השכירות. אם הוא מעכב ללא סיבה, הוא עלול לשלם פיצוי ורבית."
      },
      {
        question: "מה אם המשכיר טוען שגרמתי נזקים?",
        answer: "דרוש הוכחות לנזקים (תמונות, הערכות מחיר לתיקון), השווה למצב המתועד בכניסה, ודרוש פירוט של העלויות. אם אתה לא מסכים, פנה לבית משפט קטן או לגישור."
      },
      {
        question: "איך נותנים הודעה על עזיבת הדירה?",
        answer: "תן הודעה בכתב (מייל עם אישור קריאה או מכתב רשום) לפי המועד הנדרש בחוזה (בדרך כלל 30 יום). ציין תאריך יציאה מדויק ובקש לתאם בדיקה סופית."
      }
    ]
  },
  {
    category: "טיפים שימושיים",
    questions: [
      {
        question: "מה הטעויות הנפוצות של שוכרים?",
        answer: "לא לקרוא את החוזה בעיון, לא לתעד את מצב הדירה בכניסה, לא לשלם בזמן, לא לדווח על תקלות מיידית, ולעשות שינויים בדירה ללא אישור."
      },
      {
        question: "איך מתכוננים למעבר לדירה חדשה?",
        answer: "תכנן מראש, שכר הובלה מתאימה, עשה את המעבר בשעות מותרות, בדוק את כל המערכות אחרי המעבר, והכר את השכנים. החזר את כתובתך בכל המקומות הרלוונטיים."
      },
      {
        question: "מה עושים אם המשכיר רוצה להעלות שכירות?",
        answer: "בדוק אם זה מותר לפי החוזה והחוק, השווה למחירי שוק באזור, נסה לנגוע, ושקול אם כדאי לעבור למקום אחר. העלאה צריכה להיות סבירה ולפי הכללים החוקיים."
      },
      {
        question: "איך חוסכים כסף על דירת השכירות?",
        answer: "חפש באזורים פחות פופולריים, שקול דירה עם שותפים, נגוע על מחיר (במיוחד בחוזים ארוכים), חסוך על חשמל ומים, ושמור על הדירה כדי לקבל את הפיקדון בחזרה."
      }
    ]
  }
];

export default function RenterFAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaQuestionCircle className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              שאלות נפוצות לשוכרים
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              תשובות לשאלות הנפוצות ביותר בתהליך השכרת דירה
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/renter/1"
              className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors text-sm"
            >
              <FaHome className="h-4 w-4 ml-2" />
              חזור למדריך השוכרים
            </Link>
            
            <div className="text-sm text-gray-600" dir="rtl">
              קפיצה מהירה:
              <div className="inline-flex space-x-2 space-x-reverse mr-2">
                {faqData.map((category, index) => (
                  <a
                    key={index}
                    href={`#category-${index}`}
                    className="text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    {category.category}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} id={`category-${categoryIndex}`} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white" dir="rtl">
                  {category.category}
                </h2>
              </div>

              {/* Questions */}
              <div className="p-6" dir="rtl">
                <div className="space-y-6">
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      {/* Question */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-start">
                        <FaQuestionCircle className="h-5 w-5 text-purple-500 mt-0.5 ml-3 flex-shrink-0" />
                        {faq.question}
                      </h3>
                      
                      {/* Answer */}
                      <div className="text-gray-700 leading-relaxed mr-8">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            מוכן להתחיל לחפש דירה להשכרה?
          </h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            עקוב אחר המדריך המפורט שלנו ב-6 שלבים להשכרת דירה מוצלחת וחוקית
          </p>
          <Link
            href="/renter/1"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 transition-colors"
          >
            התחל במדריך
            <FaArrowLeft className="h-5 w-5 mr-2" />
          </Link>
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6 text-center" dir="rtl">
          <h4 className="text-lg font-semibold text-purple-800 mb-2">
            לא מצאת תשובה לשאלה שלך?
          </h4>
          <p className="text-purple-700 mb-4">
            צור קשר עם המומחים שלנו לייעוץ אישי ועזרה בתהליך השכירות
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-4 py-2 border border-purple-500 rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors"
          >
            צור קשר
          </Link>
        </div>
      </div>
    </div>
  );
} 