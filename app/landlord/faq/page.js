'use client';

import Link from 'next/link';
import { FaQuestionCircle, FaHome, FaArrowLeft } from 'react-icons/fa';

const faqData = [
  {
    category: "הכנות ראשוניות",
    questions: [
      {
        question: "האם חובה לעשות הסכם שכירות בכתב?",
        answer: "למרות שחוק השכירות לא מחייב הסכם בכתב, מומלץ מאוד לעשות הסכם כתוב. זה מגן על שני הצדדים ומבהיר את הזכויות והחובות. הסכם כתוב חשוב במיוחד במקרה של מחלוקת או בעיות משפטיות."
      },
      {
        question: "איך לדעת אם הדירה שלי צריכה שיפוץ לפני השכרה?",
        answer: "בדוק את מצב הדירה בעיני צרכן. אם הדירה נראית מוזנחת, יש בעיות תחזוקה, או שהיא לא תחרותית יחסית לדירות אחרות באזור, כדאי לשקול שיפוץ. שיפוץ טוב יכול להגדיל את מחיר השכירות ולמשוך שוכרים איכותיים יותר."
      },
      {
        question: "מה עלי לבדוק לפני שאני מפרסם את הדירה?",
        answer: "בדוק שכל המערכות תקינות (חשמל, מים, גז), וודא שאין חובות על הדירה, בדוק שהביטוח בתוקף, וודא שאין בעיות משפטיות או עיקולים על הנכס. כדאי גם לבדוק אם יש מגבלות עירוניות על השכרה."
      },
      {
        question: "האם אני חייב לדווח לביטח לאומי על השכרה?",
        answer: "כן, אתה חייב לדווח לביטח לאומי על הכנסות מהשכרה. הדיווח נעשה במסגרת הדיווח השנתי לרשות המסים, וייתכן שתצטרך לשלם מס על ההכנסות מהשכרה."
      }
    ]
  },
  {
    category: "בדיקות משפטיות וביטוח",
    questions: [
      {
        question: "איזה סוג ביטוח אני צריך לדירה המושכרת?",
        answer: "אתה צריך ביטוח מבנה שמכסה את הדירה עצמה, ביטוח אחריות כלפי צד שלישי, וביטוח נזקי מים. אם יש ריהוט שלך בדירה, תצטרך גם ביטוח תכולה. כדאי לבדוק עם חברת הביטוח שהפוליסה מכסה דירה מושכרת."
      },
      {
        question: "מה זה ביטוח שוכרים ומתי לדרוש אותו?",
        answer: "ביטוח שוכרים מכסה את התכולה של השוכר ואחריות אישית שלו. מומלץ לדרוש מהשוכר להוציא ביטוח כזה, במיוחד אם הדירה מרוהטת או אם יש ריהוט יקר. זה מגן עליך מנזקים שהשוכר עלול לגרום."
      },
      {
        question: "האם אני צריך רישיון מהעירייה להשכרת דירה?",
        answer: "ברוב המקרים אין צורך ברישיון מיוחד להשכרת דירה רגילה. אבל בערים מסוימות או להשכרה קצרת מועד (כמו Airbnb) יכולות להיות דרישות מיוחדות. כדאי לבדוק עם העירייה המקומית."
      },
      {
        question: "מה עלי לעשות אם יש חובות על הדירה?",
        answer: "יש לסגור את כל החובות לפני השכרה. זה כולל ארנונה, חשמל, מים, גז וחובות וועד בית. חובות על הדירה עלולים לגרום לבעיות משפטיות ולפגוע ביכולת להשכיר."
      }
    ]
  },
  {
    category: "תמחור ושיווק",
    questions: [
      {
        question: "איך לדעת מה המחיר הנכון לדירה שלי?",
        answer: "בדוק מחירים של דירות דומות באזור באתרים כמו יד2 ומדד. התחשב בגודל הדירה, מצבה, קומה, חניה, קרבה לתחבורה ושירותים. כדאי לקבוע מחיר מעט גבוה יותר כדי להשאיר מקום למשא ומתן."
      },
      {
        question: "מה עושים אם הדירה לא מתפנה לשוכרים?",
        answer: "בדוק אם המחיר מתאים לשוק, שפר את הצילום או התיאור, וודא שהדירה נראית טוב. ייתכן שתצטרך להוריד מעט את המחיר או לשפר את מצב הדירה. כדאי גם לבדוק אם אתה מפרסם במקומות הנכונים."
      },
      {
        question: "האם כדאי להשכיר דירה מרוהטת או לא מרוהטת?",
        answer: "דירה מרוהטת בדרך כלל מביאה מחיר שכירות גבוה יותר, אבל גם כרוכה בסיכון נוסף של נזקים לרהיטים. היא מושכת שוכרים לטווח קצר יותר. דירה לא מרוהטת מושכת שוכרים יציבים יותר לטווח ארוך."
      },
      {
        question: "איך לצלם את הדירה למודעה?",
        answer: "צלם בשעות יום עם הרבה אור טבעי, הקפד על זוויות רחבות שמראות את גודל החדרים, נקה וסדר לפני הצילום, וצלם את כל החדרים החשובים. תמונות טובות הן הדבר הכי חשוב בפרסום."
      }
    ]
  },
  {
    category: "בחירת שוכר",
    questions: [
      {
        question: "איך לבחור שוכר טוב?",
        answer: "בדוק יציבות תעסוקתית, הכנסות קבועות (לפחות פי 3 מדמי השכירות), המלצות מבעלי בית קודמים, וכנות בשיחה. חשוב גם הרושם האישי - שוכר אחראי ונעים יחסוך לך בעיות בעתיד."
      },
      {
        question: "אלו מסמכים לבקש מהשוכר?",
        answer: "תלושי שכר מ-3 חודשים אחרונים, אישור מעסיק, המלצות מבעלי בית קודמים, צילום תעודת זהות. במקרים מסוימים אפשר לבקש גם בדיקת אשראי. חשוב לא לפלות ולבקש מסמכים רלוונטיים בלבד."
      },
      {
        question: "מה עושים אם השוכר לא עובר את הבדיקה?",
        answer: "אם השוכר לא עומד בקריטריונים שלך, תוכל לבקש ערב או ערבות בנקאית. אם זה לא מספיק, עדיף לחפש שוכר אחר. חשוב לא להתפשר על הקריטריונים הבסיסיים."
      },
      {
        question: "האם חוקי לבקש פיקדון ובאיזה סכום?",
        answer: "כן, חוקי לבקש פיקדון. הסכום הנפוץ הוא 1-2 חודשי שכירות. הפיקדון משמש להבטחת נזקים ולכיסוי חובות של השוכר. חשוב לרשום את הפיקדון בהסכם ולהחזיר אותו בסיום התקופה אם אין נזקים."
      }
    ]
  },
  {
    category: "הסכם השכירות",
    questions: [
      {
        question: "מה חובה לכתוב בהסכם השכירות?",
        answer: "פרטי המשכיר והשוכר, תיאור הדירה, מחיר השכירות, תקופת השכירות, סכום הפיקדון, חלוקת האחריות על הוצאות (חשמל, מים, ארנונה), התחייבויות השוכר, ותנאי סיום ההסכם."
      },
      {
        question: "מה ההבדל בין הסכם לתקופה קצובה ולא קצובה?",
        answer: "הסכם לתקופה קצובה (למשל שנה) נגמר באופן אוטומטי בסיום התקופה. הסכם לא קצוב יכול להיות מופסק על ידי כל צד עם הודעה מוקדמת. לכל סוג יש יתרונות וחסרונות לפי הצרכים שלך."
      },
      {
        question: "מה עושים אם השוכר מבקש לשנות את ההסכם?",
        answer: "כל שינוי בהסכם צריך להיות בכתב ובהסכמת שני הצדדים. אם השינוי סביר ומועיל לשני הצדדים, אפשר לקבל אותו. חשוב לתעד כל שינוי בכתב ולוודא שהוא משפטי."
      },
      {
        question: "האם אפשר לכלול איסור על חיות מחמד?",
        answer: "כן, אפשר לכלול איסור על חיות מחמד בהסכם. זה חוקי ונאכף. אבל אם תסכים לחיות מחמד, כדאי לכלול בהסכם אחריות נוספת על נזקים וניקיון."
      }
    ]
  },
  {
    category: "ניהול השכירות",
    questions: [
      {
        question: "מה עושים אם השוכר לא משלם שכירות?",
        answer: "התחל עם תזכורת ידידותית, אחר כך התראה רשמית בכתב. אם השוכר לא מגיב, פנה לעורך דין לייעוץ. בסופו של דבר יהיה צורך להגיש תביעה לבית המשפט לפינוי ולגבית החוב."
      },
      {
        question: "איך לטפל בתלונות של השוכר?",
        answer: "הקשב לתלונה, בדוק את הבעיה, וטפל בה במהירות אם היא מוצדקת. אם התלונה לא מוצדקת, הסבר בנימוס את עמדתך. תקשורת טובה עם השוכר מונעת בעיות גדולות יותר."
      },
      {
        question: "מתי אני חייב לתקן משהו בדירה?",
        answer: "אתה חייב לתקן דברים שהם באחריות המשכיר לפי החוק והסכם השכירות. זה כולל בעיות מבניות, מערכות יסוד (חשמל, מים), ובעיות בטיחות. תיקונים קטנים בדרך כלל באחריות השוכר."
      },
      {
        question: "האם אני יכול להיכנס לדירה בלי רשות השוכר?",
        answer: "לא, אתה לא יכול להיכנס לדירה בלי רשות השוכר אלא במקרי חירום. לכל כניסה נדרשת הודעה מוקדמת והסכמה של השוכר. זו זכות הפרטיות של השוכר."
      },
      {
        question: "מה עושים אם השוכר גורם לנזקים?",
        answer: "תעד את הנזקים בצילום, שלח התראה לשוכר, וקבל הערכת מחיר לתיקון. אם השוכר לא מתקן, תוכל לנכות מהפיקדון או לתבוע פיצויים. חשוב לפעול מהר ולא לחכות לסיום השכירות."
      }
    ]
  },
  {
    category: "סיום השכירות",
    questions: [
      {
        question: "איך לסיים את השכירות בצורה חוקית?",
        answer: "תן הודעה מוקדמת לפי מה שנקבע בהסכם (בדרך כלל 30 יום), בדוק את מצב הדירה, חשב נזקים אם יש, והחזר את הפיקדון תוך 30 יום. חשוב לתעד הכל בכתב ובצילום."
      },
      {
        question: "מתי אני יכול לא להחזיר את הפיקדון?",
        answer: "אתה יכול לנכות מהפיקדון רק נזקים שמעבר לבלאי רגיל, חובות שכירות, או הוצאות ניקיון מיוחדות. אסור לנכות בעד בלאי רגיל כמו שחיקת צבע או שטיחים."
      },
      {
        question: "מה עושים אם השוכר לא רוצה לעזוב?",
        answer: "אם השוכר לא עוזב בסיום התקופה, תצטרך להגיש תביעה לבית המשפט לפינוי. זה הליך משפטי שלוקח זמן, לכן חשוב לתת הודעה מוקדמת ולתעד הכל."
      },
      {
        question: "איך להכין את הדירה לשוכר הבא?",
        answer: "בדוק את מצב הדירה, תקן נזקים אם יש, נקה יסודי, בדוק שכל המערכות תקינות, וצבע אם נדרש. הדירה צריכה להיות במצב טוב לשוכר הבא."
      }
    ]
  }
];

export default function LandlordFAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaQuestionCircle className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              שאלות נפוצות למשכירים
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
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
              href="/landlord/1"
              className="inline-flex items-center px-4 py-2 border border-orange-300 rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors text-sm"
            >
              <FaHome className="h-4 w-4 ml-2" />
              חזור למדריך המשכירים
            </Link>
            
            <div className="text-sm text-gray-600" dir="rtl">
              קפיצה מהירה:
              <div className="inline-flex space-x-2 space-x-reverse mr-2">
                {faqData.map((category, index) => (
                  <a
                    key={index}
                    href={`#category-${index}`}
                    className="text-orange-600 hover:text-orange-800 hover:underline"
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
              <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
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
                        <FaQuestionCircle className="h-5 w-5 text-orange-500 mt-0.5 ml-3 flex-shrink-0" />
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
        <div className="mt-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            מוכן להתחיל להשכיר את הדירה?
          </h3>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            עקוב אחר המדריך המפורט שלנו ב-6 שלבים להשכרת דירה מוצלחת וחוקית
          </p>
          <Link
            href="/landlord/1"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-orange-600 bg-white hover:bg-orange-50 transition-colors"
          >
            התחל במדריך
            <FaArrowLeft className="h-5 w-5 mr-2" />
          </Link>
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6 text-center" dir="rtl">
          <h4 className="text-lg font-semibold text-orange-800 mb-2">
            לא מצאת תשובה לשאלה שלך?
          </h4>
          <p className="text-orange-700 mb-4">
            צור קשר עם המומחים שלנו לייעוץ אישי ועזרה בתהליך השכירות
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-4 py-2 border border-orange-500 rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors"
          >
            צור קשר
          </Link>
        </div>
      </div>
    </div>
  );
} 