import Link from 'next/link';
import { FaQuestionCircle, FaHome, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const faqData = [
  {
    category: "כללי",
    questions: [
      {
        question: "האם אני חייב להשתמש בסוכן נדל\"ן למכירת הדירה?",
        answer: "לא, אתה יכול למכור את הדירה באופן עצמאי. עם זאת, סוכן נדל\"ן יכול לעזור בפרסום, מציאת קונים ובניהול התהליך. החלטה זו תלויה ברמת הנוחות שלך ובזמן הפנוי שיש לך."
      },
      {
        question: "כמה זמן לוקח בממוצע למכור דירה?",
        answer: "זמן המכירה משתנה בהתאם לגורמים רבים: מיקום הדירה, מצבה, המחיר, ומצב השוק. בממוצע, זה יכול לקחת בין 2-6 חודשים. דירות במיקומים מבוקשים ובמחיר תחרותי נמכרות מהר יותר."
      },
      {
        question: "מה ההוצאות הכרוכות במכירת דירה?",
        answer: "ההוצאות כוללות: דמי עורך דין (1.5%-2% מערך הדירה), מס רווח הון (אם רלוונטי), דמי תיווך (אם משתמשים בסוכן), צילום מקצועי, ועלויות פרסום. חשוב לחשב את כל ההוצאות מראש."
      }
    ]
  },
  {
    category: "תמחור ושמאות",
    questions: [
      {
        question: "איך אני יודע שהמחיר שקבעתי לדירה נכון?",
        answer: "בצע מחקר שוק יסודי - השווה דירות דומות באזור, השתמש בכלים דיגיטליים להערכת שווי, והתייעץ עם שמאי מקרקעין מוסמך. חשוב לקחת בחשבון את מצב הדירה, המיקום, והביקוש באזור."
      },
      {
        question: "האם כדאי להוריד את המחיר אם הדירה לא נמכרת?",
        answer: "אם הדירה לא נמכרת תוך 2-3 חודשים ויש לך צפיות מספיקות אבל אין הצעות, ייתכן שהמחיר גבוה מדי. בדוק שוב את השוק ושקול הורדה של 5%-10% מהמחיר המקורי."
      },
      {
        question: "מתי כדאי להשקיע בשיפוצים לפני המכירה?",
        answer: "השקע בשיפוצים קלים שמשפרים את המראה: צביעה, תיקון נזילות, שיפוץ חדרי רחצה ומטבח אם הם ישנים מאוד. שיפוצים יקרים בדרך כלל לא מחזירים את עצמם במחיר המכירה."
      }
    ]
  },
  {
    category: "היבטים משפטיים",
    questions: [
      {
        question: "מה קורה אם יש משכנתא על הדירה?",
        answer: "אם יש משכנתא, תצטרך לפרוע אותה ביום העברת הבעלות. עורך הדין יתאם עם הבנק את סילוק המשכנתא. אם יתרת המשכנתא גבוהה ממחיר המכירה, תצטרך להשלים את ההפרש מכיסך."
      },
      {
        question: "האם חייב להיות עורך דין בעסקת מכירת דירה?",
        answer: "כן, על פי חוק חובה להשתמש בעורך דין רשום בעסקאות נדל\"ן. עורך הדין מבצע בדיקות משפטיות, מנסח את החוזה, ומבצע את העברת הבעלות בטאבו."
      },
      {
        question: "מה קורה אם מתגלה בעיה משפטית בדירה לאחר הפרסום?",
        answer: "אם מתגלה בעיה משפטית (עיקול, חוב, בעיה ברישום), חשוב לטפל בה מיידית. יש להפסיק את הפרסום עד לפתרון הבעיה, ולהתייעץ עם עורך דין כיצד לפתור אותה."
      }
    ]
  },
  {
    category: "פרסום ושיווק",
    questions: [
      {
        question: "באילו אתרים כדאי לפרסם את הדירה?",
        answer: "האתרים המובילים הם: יד2, מדלן, הומלס. כדאי גם לפרסם ב-Facebook Marketplace ובקבוצות נדל\"ן מקומיות. פרסום במספר פלטפורמות מגדיל את החשיפה."
      },
      {
        question: "איזה תמונות חשוב לצלם לפרסום?",
        answer: "צלם את כל החדרים, הכניסה, המטבח, חדרי הרחצה, המרפסת (אם יש), החניה, ונוף מהחלונות. צלם באור טבעי, שמור על סדר ונקיון, והדגש את היתרונות הייחודיים של הדירה."
      },
      {
        question: "איך כותבים תיאור אטרקטיבי לדירה?",
        answer: "התחיל עם הנתונים הבסיסיים (גודל, חדרים, קומה), הדגש את היתרונות (מיקום, נוף, שיפוצים), ציין שירותים קרובים (תחבורה, חינוך, קניות). השתמש בשפה חיובית אבל הישאר מדויק ואמיתי."
      }
    ]
  },
  {
    category: "משא ומתן ומכירה",
    questions: [
      {
        question: "איך מתמודדים עם הצעת מחיר נמוכה?",
        answer: "אל תדחה מיד - בקש הסבר להצעה. אם ההצעה סבירה יחסית, אתה יכול להציע פשרה. אם היא נמוכה מדי, הסבר את ערך הדירה ותן זמן לקונה לחשוב. זכור שמשא ומתן הוא תהליך."
      },
      {
        question: "מה לעשות אם יש כמה קונים מעוניינים?",
        answer: "זה מצב מעולה! אתה יכול לעדכן את כל הקונים שיש עניין נוסף ולבקש הצעות סופיות. שמור על שקיפות ועדכן את כולם על לוחות הזמנים. בחר את ההצעה הטובה ביותר - לא רק מבחינת מחיר אלא גם אמינות הקונה."
      },
      {
        question: "מתי מקבלים את ההצעה ומתקדמים לחוזה?",
        answer: "קבל הצעה כשאתה מרוצה מהמחיר והקונה נראה רציני ואמין. ודא שהקונה יכול לממן את הרכישה, קבע לוחות זמנים ברורים, והתחל בתהליך החוזה עם עורך דין."
      }
    ]
  },
  {
    category: "היבטים פיננסיים",
    questions: [
      {
        question: "מה זה מס רווח הון ומתי צריך לשלם אותו?",
        answer: "מס רווח הון הוא מס על הרווח ממכירת נכס. אם הדירה לא הייתה דירת מגורים יחידה שלך, או אם מכרת אותה תוך פחות מ-18 חודשים מהרכישה, ייתכן שתצטרך לשלם מס. היוועץ עם רואה חשבון."
      },
      {
        question: "איך מוודאים שהקונה יכול לממן את הרכישה?",
        answer: "בקש מהקונה אישור עקרוני למשכנתא מהבנק או הוכחת יכולת מימון. אל תסתמך רק על הבטחות. עורך הדין יוכל לעזור לוודא שהמימון מובטח לפני חתימת החוזה."
      },
      {
        question: "מה קורה עם התשלומים השוטפים עד למסירת הדירה?",
        answer: "עד ליום מסירת הדירה, אתה אחראי על כל התשלומים השוטפים: ארנונה, ועד בית, חשמל, מים וגז. ביום המסירה מתבצע חישוב יחסי (פרורציה) של ההוצאות."
      }
    ]
  }
];

export default function SellerFAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaQuestionCircle className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              שאלות נפוצות למוכרים
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              תשובות לשאלות הנפוצות ביותר בתהליך מכירת דירה
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/seller/1"
              className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors text-sm"
            >
              <FaHome className="h-4 w-4 ml-2" />
              חזור למדריך המוכרים
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
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
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
                        <FaQuestionCircle className="h-5 w-5 text-blue-500 mt-0.5 ml-3 flex-shrink-0" />
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
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            מוכן להתחיל במכירת הדירה?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            עקוב אחר המדריך המפורט שלנו ב-6 שלבים קלים למכירת דירה מוצלחת
          </p>
          <Link
            href="/seller/1"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
          >
            התחל במדריך
            <FaArrowLeft className="h-5 w-5 mr-2" />
          </Link>
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center" dir="rtl">
          <h4 className="text-lg font-semibold text-yellow-800 mb-2">
            לא מצאת תשובה לשאלה שלך?
          </h4>
          <p className="text-yellow-700 mb-4">
            צור קשר עם המומחים שלנו לייעוץ אישי ומקצועי
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-4 py-2 border border-yellow-500 rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 transition-colors"
          >
            צור קשר
          </Link>
        </div>
      </div>
    </div>
  );
} 