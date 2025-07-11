import Link from 'next/link';
import { FaQuestionCircle, FaHome, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const faqData = [
  {
    category: "משכנתא ומימון",
    questions: [
      {
        question: "כמה הון עצמי אני צריך לרכישת דירה?",
        answer: "ברוב המקרים, עליכם להציג הון עצמי של לפחות 25%-30% ממחיר הדירה, תלוי בסוג הדירה ובתנאים האישיים שלכם. לדירה ראשונה הדרישות עשויות להיות נמוכות יותר."
      },
      {
        question: "מה זה אישור עקרוני למשכנתא וכמה זמן הוא תקף?",
        answer: "אישור עקרוני הוא אישור ראשוני מהבנק שאתם זכאים לקבל משכנתא תחת תנאים מסוימים. האישור כולל את סכום ההלוואה, הריבית הצפויה ופריסת ההחזר. הוא בדרך כלל תקף למספר חודשים (3-6 חודשים)."
      },
      {
        question: "איך הבנק מחשב את יכולת ההחזר שלי?",
        answer: "הבנק מחשב את יכולת ההחזר בדרך כלל כשליש מההכנסה החודשית נטו. הוא לוקח בחשבון את כל ההכנסות הקבועות, מפחית הוצאות קבועות וחובות קיימים, ובודק יציבות פיננסית כללית."
      },
      {
        question: "מה ההבדל בין משכנתא קבועה למשתנה?",
        answer: "משכנתא קבועה - הריבית נשארת קבועה לאורך כל תקופת ההלוואה. משכנתא משתנה - הריבית משתנה בהתאם לשינויים בריבית הבנק. לכל סוג יש יתרונות וחסרונות תלוי במצב השוק הכלכלי."
      }
    ]
  },
  {
    category: "חיפוש וביקור בדירות",
    questions: [
      {
        question: "איך אני יודע שמחיר הדירה הוגן?",
        answer: "השוו את מחיר הדירה לדירות דומות באזור באתרים כמו יד2 ומדלן. בדקו מחירי מכירה אחרונים באזור, לא רק מחירי הצעה. שקלו להזמין שמאי מקרקעין להערכה מקצועית לדירות יקרות."
      },
      {
        question: "על מה חשוב לשאול את המוכר בביקור?",
        answer: "שאלו למה הדירה נמכרת, מה ההוצאות החודשיות (ארנונה, ועד בית), האם יש חובות על הדירה, מה מצב השכנים והבנין, והאם יש תוכניות פיתוח עתידיות באזור."
      },
      {
        question: "איך אני בודק את מצב הדירה הפיזי?",
        answer: "בדקו קירות לחיפוש סדקים או רטיבות, מערכות חשמל וצנרת, מצב החלונות והדלתות, כיוון הדירה וכמות האור. אם מדובר בדירה ישנה, שקלו הזמנת מומחה לבדיקה מקצועית."
      },
      {
        question: "כמה דירות כדאי לראות לפני החלטה?",
        answer: "אין מספר קבוע, אבל מומלץ לראות לפחות 5-10 דירות כדי לקבל תחושה לשוק ולמחירים. זה עוזר לכם להבין מה סטנדרטי באזור ולזהות הזדמנויות טובות."
      }
    ]
  },
  {
    category: "היבטים משפטיים",
    questions: [
      {
        question: "למה חשוב עורך דין שמתמחה במקרקעין?",
        answer: "עורך דין מומחה במקרקעין מכיר את כל החוקים והתקנות הרלוונטיים, יודע איך לבצע בדיקות מעמיקות על הנכס, ויכול למנוע בעיות משפטיות עתידיות. עורך דין כללי עלול להחמיץ פרטים חשובים."
      },
      {
        question: "איך אני בודק שהמוכר הוא הבעלים החוקי?",
        answer: "עורך הדין יבדוק את רישומי הטאבו ויוודא שהמוכר רשום כבעלים. אתם יכולים גם לבקש לראות את תעודת הזכויות על הדירה ולבדוק שאין עיקולים או שיעבודים על הנכס."
      },
      {
        question: "מה קורה אם מתגלות בעיות משפטיות אחרי החתימה?",
        answer: "אם עורך הדין ביצע את הבדיקות כנדרש, הוא אחראי לבעיות שלא התגלו. לכן חשוב לעבוד עם עורך דין מומחה ומבוטח. אם הבעיות נגרמו בגלל הסתרת מידע מצד המוכר, ניתן לתבוע אותו."
      },
      {
        question: "מה כלול בעלויות עורך הדין?",
        answer: "עלות עורך הדין כוללת בדרך כלל את כל הבדיקות המשפטיות, ניסוח החוזה, ליווי התהליך והעברת הבעלות. העלות היא בדרך כלל 1.5%-2% מערך הדירה, תלוי במורכבות העסקה."
      }
    ]
  },
  {
    category: "עלויות ומיסים",
    questions: [
      {
        question: "מה זה מס רכישה וכמה הוא עולה?",
        answer: "מס רכישה הוא מס שמשלמים על רכישת דירה. השיעור משתנה בין 3.5% ל-10% בהתאם לערך הדירה ולמעמד הקונה (דירה ראשונה, יחיד/זוג, משקיע). לדירה ראשונה יש הקלות משמעותיות."
      },
      {
        question: "אילו עלויות נוספות יש מלבד מחיר הדירה?",
        answer: "עלויות נוספות כוללות: מס רכישה (3.5%-10%), עורך דין (1.5%-2% מערך הדירה), שמאי (אם נדרש), ביטוח דירה, עלויות שיפוצים, והוצאות מעבר. כדאי לתכנן 5%-15% נוספים על מחיר הדירה."
      },
      {
        question: "מתי משלמים את מס הרכישה?",
        answer: "מס הרכישה צריך להישלם תוך 50 יום מהחתימה על החוזה או מקבלת החזקה בדירה (המוקדם מבין השניים). עיכוב בתשלום גורר קנסות כבדים, לכן חשוב לתכנן את התשלום מראש."
      },
      {
        question: "האם יש הקלות במס לדירה ראשונה?",
        answer: "כן, יש הקלות משמעותיות לרוכש דירה ראשונה. הקלות כוללות שיעור מס נמוך יותר או פטור ממס (תלוי בערך הדירה), ותנאי משכנתא מועדפים. חשוב לבדוק את הזכאות מראש."
      }
    ]
  },
  {
    category: "תהליך הרכישה",
    questions: [
      {
        question: "כמה זמן לוקח תהליך רכישת דירה?",
        answer: "התהליך המלא יכול לקחת 2-6 חודשים, תלוי במורכבות העסקה ובמהירות הבירוקרטיה. שלב קבלת המשכנתא לוקח 2-4 שבועות, חיפוש הדירה משתנה, והתהליך המשפטי לוקח 4-8 שבועות."
      },
      {
        question: "מה קורה אחרי שחותמים על החוזה?",
        answer: "אחרי החתימה על החוזה, עורך הדין מבצע את העברת הבעלות בטאבו, מוודא תשלום מס הרכישה, מטפל בהעברת הכספים ובמסירת הדירה. זה בדרך כלל לוקח 4-6 שבועות."
      },
      {
        question: "איך מתמודדים עם בעיות שמתגלות בדירה אחרי הרכישה?",
        answer: "אם הבעיות היו קיימות לפני הרכישה והמוכר הסתיר אותן, ניתן לתבוע אותו. אם הבעיות חדשות, זו אחריות הקונה. לכן חשוב לבדוק היטב את הדירה לפני הרכישה ולתעד הכל."
      },
      {
        question: "מה עושים אם רוצים לבטל את העסקה?",
        answer: "ביטול עסקה תלוי בשלב שבו אתם נמצאים ובתנאי החוזה. לפני החתימה - בדרך כלל אפשר לבטל בקלות. אחרי החתימה - יש לבדוק את תנאי הביטול בחוזה. ביטול עלול להיות כרוך בקנסות."
      }
    ]
  },
  {
    category: "טיפים והמלצות",
    questions: [
      {
        question: "מה הטעויות הנפוצות ביותר של קונים?",
        answer: "טעויות נפוצות: לא לבדוק היטב את מצב הדירה, לא להשוות מחירים, לא לבדוק הוצאות נוספות, לבחור עורך דין לא מומחה, ולא לתכנן תקציב מלא כולל כל העלויות הנלוות."
      },
      {
        question: "איך מכינים תקציב נכון לרכישת דירה?",
        answer: "חשבו את מחיר הדירה + מס רכישה + עורך דין + שיפוצים צפויים + הוצאות מעבר. הוסיפו 10%-15% מרווח ביטחון. ודאו שנשאר לכם כסף לחירום ולהוצאות השוטפות של הדירה החדשה."
      },
      {
        question: "מתי כדאי להחליט על שיפוצים לפני הרכישה?",
        answer: "אם הדירה זקוקה לשיפוצים משמעותיים, כדאי לקבל הצעות מחיר מקבלנים לפני הרכישה. זה יעזור לכם להחליט אם כדאי לרכוש או לחפש דירה אחרת, ולמשא ומתן על המחיר."
      },
      {
        question: "איך בוחרים אזור נכון לרכישה?",
        answer: "בחרו אזור לפי הצרכים שלכם: קרבה לעבודה, בתי ספר, תחבורה ציבורית. בדקו את פוטנציאל הפיתוח של האזור, מחירי השכירות (אם רלוונטי), ואת איכות החיים. בקרו באזור בשעות שונות ביום."
      }
    ]
  }
];

export default function BuyerFAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaQuestionCircle className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              שאלות נפוצות לקונים
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              תשובות לשאלות הנפוצות ביותר בתהליך רכישת דירה
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/buyer/1"
              className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition-colors text-sm"
            >
              <FaHome className="h-4 w-4 ml-2" />
              חזור למדריך הקונים
            </Link>
            
            <div className="text-sm text-gray-600" dir="rtl">
              קפיצה מהירה:
              <div className="inline-flex space-x-2 space-x-reverse mr-2">
                {faqData.map((category, index) => (
                  <a
                    key={index}
                    href={`#category-${index}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
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
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
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
                        <FaQuestionCircle className="h-5 w-5 text-green-500 mt-0.5 ml-3 flex-shrink-0" />
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
        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            מוכן להתחיל ברכישת דירה?
          </h3>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            עקוב אחר המדריך המפורט שלנו ב-6 שלבים קלים לרכישת דירה מוצלחת
          </p>
          <Link
            href="/buyer/1"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors"
          >
            התחל במדריך
            <FaArrowLeft className="h-5 w-5 mr-2" />
          </Link>
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center" dir="rtl">
          <h4 className="text-lg font-semibold text-blue-800 mb-2">
            לא מצאת תשובה לשאלה שלך?
          </h4>
          <p className="text-blue-700 mb-4">
            צור קשר עם המומחים שלנו לייעוץ אישי ומקצועי
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-4 py-2 border border-blue-500 rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
          >
            צור קשר
          </Link>
        </div>
      </div>
    </div>
  );
} 