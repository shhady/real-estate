import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaSearch, FaCamera, FaHandshake, FaDollarSign, FaFileContract, FaArrowRight, FaArrowLeft, FaClock, FaCheckCircle, FaArrowCircleLeft, FaArrowCircleRight, FaQuestionCircle } from 'react-icons/fa';

// מידע השלבים
const steps = {
  1: {
    title: "הכנה משפטית ורישומית",
    icon: <FaHome className="h-8 w-8" />,
    description: "בדיקת המצב המשפטי של הדירה והכנת המסמכים הנדרשים",
    content: {
      intro: "לפני שמפרסמים את הדירה למכירה, ישנם כמה צעדים חשובים שצריך לבצע על מנת להבטיח שהמכירה תתנהל בצורה חוקית, מסודרת ובטוחה.",
      sections: [
        {
          title: "בדיקת רישום הנכס בטאבו או במרשם המקרקעין",
          content: [
            "הצעד הראשון שצריך לבצע הוא לוודא שהדירה רשומה בצורה נכונה על שמך בטאבו (או במרשם המקרקעין, תלוי במיקום הנכס).",
            "וודא שאתה (המוכר) אכן הבעלים החוקיים של הדירה והיא רשומה על שמך ברישומים הרשמיים.",
            "בדוק שאין עיקולים או חובות על הדירה - אם יש על הדירה עיקול, חוב או בעיות פיננסיות אחרות, ייתכן שיהיה קשה או בלתי אפשרי למכור אותה."
          ]
        },
        {
          title: "וידוא שהדירה נקייה מכל בעיה משפטית",
          content: [
            "בדוק חוזים עם שוכרים: אם יש לך שוכר בדירה, עליך לבדוק את תנאי החוזה עימו.",
            "ודא שאין תביעות משפטיות פתוחות שעשויות להשפיע על המכירה של הדירה.",
            "במקרה ויש בעיות משפטיות, פנה לעורך דין למקרקעין שיסייע לך להפסיק את התביעות או להוציא את הדירה ממסגרת בעייתית."
          ]
        },
        {
          title: "טיפול במשכנתא",
          content: [
            "אם הדירה שלך משועבדת כבטוחה להלוואת משכנתא, יש לוודא שניתן לסלק את המשכנתא ולהעביר את הנכס לקונה החדש בצורה תקינה.",
            "פנה לבנק שבו יש לך את המשכנתא וודא שיש אפשרות לפרוע את החוב על הדירה ולהסיר את השעבוד מהנכס."
          ]
        },
        {
          title: "הכנת מסמכים משפטיים",
          content: [
            "תעודת זכויות על הדירה - מסמך המעיד שאתה הבעלים החוקיים של הדירה",
            "הסכם רכישה קודם - אם יש לך עותק מההסכם שבו רכשת את הדירה",
            "שומות ארנונה וחשבונות שונים - וודא שאין חובות פתוחים כלפי הרשות המקומית"
          ]
        },
        {
          title: "פנייה לעורך דין למקרקעין",
          content: [
            "חשוב לפנות לעורך דין למקרקעין שיבצע את כל הבדיקות המשפטיות הנדרשות.",
            "עורך הדין יוכל לבדוק את מצב הדירה מבחינה משפטית, להכין את כל המסמכים הרלוונטיים ולוודא שהעסקה תתנהל בצורה חוקית ובטוחה."
          ]
        }
      ],
      summary: "השלב הראשון הוא קריטי מכיוון שברגע שהדירה מפורסמת למכירה, כל בעיה שתתגלה לאחר מכן עשויה להאט את התהליך או לגרום לבעיות משפטיות בהמשך. לפיכך, כדאי להקדיש זמן להסדרת כל הדברים הללו לפני שתתחיל את תהליך המכירה."
    }
  },
  2: {
    title: "קביעת מחיר נכון",
    icon: <FaDollarSign className="h-8 w-8" />,
    description: "איך לדעת מהו המחיר הנכון למכור את הדירה",
    content: {
      intro: "קביעת המחיר הנכון היא אחד השלבים הקריטיים ביותר במכירת הדירה. מחיר גבוה מדי יבהיל קונים, ומחיר נמוך מדי יגרום לך להפסיד כסף.",
      sections: [
        {
          title: "להבין את השוק הנדל\"ני באזור",
          content: [
            "חפש דירות דומות לדירה שלך באותו אזור - דירות דומות הן כאלה שמאופיינות בגודל דומה, במצב דומה, ובאותה שכונה או אזור גיאוגרפי.",
            "השתמש באתרים למכירת דירות (כגון יד2, מדלן) כדי לראות את המחירים של דירות שנמכרות עכשיו.",
            "בקר בדירות פתוחות באותו אזור כדי להבין איך המחירים משתנים לפי המאפיינים של כל דירה."
          ]
        },
        {
          title: "הערכת מצב הדירה",
          content: [
            "בדוק את מצב הדירה - האם היא חדשה או ישנה? אם הדירה עברה שיפוץ לאחרונה, היא שווה יותר.",
            "קח בחשבון את כמות החדרים ומטרים רבועים - ככל שהדירה גדולה יותר, סביר להניח שהיא תהיה יקרה יותר.",
            "התחשב בתוספות כמו מרפסת, חניה פרטית, גינה או נוף טוב - כל פרט נוסף יכול להעלות את ערך הדירה."
          ]
        },
        {
          title: "הערכת שווי דירה לפי השוק",
          content: [
            "השתמש בכלים און-ליין להערכת שווי - אתרים כמו מדלן מציעים שירותים שמספקים הערכות שווי של דירות לפי נתונים עדכניים.",
            "שכור שמאי מקרקעין מוסמך - אם חשוב לך לדעת את הערך המדויק ביותר של הדירה.",
            "התייעץ עם עורך דין למקרקעין - יכול להציע לך ייעוץ בנוגע למחיר הדירה, במיוחד אם יש נכס עם מצבים מיוחדים."
          ]
        },
        {
          title: "התחשבות במגבלות ובדרישות שלך",
          content: [
            "קבע את המחיר המינימלי שאתה מוכן לקבל - הבן איזה סכום מינימלי אתה מוכן לקבל על הדירה.",
            "קח בחשבון את כל ההוצאות שכרוכות במכירה (מיסים, דמי תיווך אם יש, הוצאות שיפוץ אם היו).",
            "החלט אם אתה מוכן להתגמש במחיר אם הדירה לא נמכרת תוך זמן קצר."
          ]
        },
        {
          title: "בדיקת התחרות והביקוש",
          content: [
            "בדוק את כמות הדירות הדומות באזור - אם יש הרבה דירות שמפורסמות לאותו סוג באזור שלך, זה עשוי להוריד את המחיר.",
            "הערך את הביקוש באזור - אם יש ביקוש גבוה לאזור, אתה עשוי להיות יכול למכור במחיר גבוה יותר."
          ]
        }
      ],
      summary: "הדרך הטובה ביותר לקבוע מחיר נכון היא לשלב בין כל הגורמים הללו ולפנות לאנשי מקצוע שמתמחים בכך - כמו שמאים, עורך דין למקרקעין, או סוכן נדל\"ן."
    }
  },
  3: {
    title: "פרסום הדירה",
    icon: <FaCamera className="h-8 w-8" />,
    description: "איך לפרסם את הדירה ולמצוא קונים בפלטפורמות השונות",
    content: {
      intro: "פרסום נכון של הדירה הוא המפתח למציאת קונים איכותיים. תמונות טובות ותיאור מעניין יכולים לעשות את ההבדל.",
      sections: [
        {
          title: "הכנת הדירה לפרסום",
          content: [
            "נקה את הדירה, סדר את הרהיטים, ווודא שאין שאריות או בעיות שיכולות להרתיע קונים פוטנציאליים.",
            "בצע שיפוצים קטנים כמו תיקוני צבע, תיקון נזילות, או החלפת אורות שרופים.",
            "הדגש את היתרונות - אם לדירה יש יתרונות ייחודיים, כמו נוף יפה, חדרים מרווחים, חניה פרטית, מרפסת או גינה."
          ]
        },
        {
          title: "צילום הדירה",
          content: [
            "שקול צילום מקצועי - צלם מקצועי יוכל להדגיש את היתרונות של הדירה ולצלם אותה בתאורה הנכונה.",
            "צילום עצמי איכותי - השתמש במצלמה איכותית (טלפון חכם עם מצלמה טובה), צלם בחדרים מוארים ביום עם אור טבעי.",
            "צלם את כל חדרי הדירה, כולל את המרפסת אם יש, את החניה, ואת כל היתרונות הייחודיים של הנכס."
          ]
        },
        {
          title: "יצירת תיאור מעניין ומפורט",
          content: [
            "תיאור כללי של הדירה - כמה חדרים יש בדירה? איזה גודל יש לה (במ\"ר)? האם יש מרפסת, חניה, גינה?",
            "מיקום הדירה - הדגש את היתרונות של המיקום, קרבה לתחבורה ציבורית, מרכזים קניות, בתי ספר, פארקים.",
            "המצב של הדירה - אם הדירה שופצה, ציין זאת, ואם לא, הזכר את המצב הכללי של הדירה.",
            "יתרונות נוספים - נוף יפה, קרבה לחוף, או אפשרות לבניית תוספות בעתיד."
          ]
        },
        {
          title: "פרסום באתרים המתאימים",
          content: [
            "יד2 - אחד האתרים הגדולים ביותר לפרסום דירות למכירה. מציע אפשרות לפרסום חינם או בתשלום.",
            "מדלן - אתר המתמקד בנדל\"ן בישראל ומספק פלטפורמת פרסום דירות וכלים לניתוח שווי.",
            "הומלס - אתר נוסף המציע פלטפורמה לפרסום דירות למכירה.",
            "Facebook Marketplace - פלטפורמה בתוך פייסבוק המאפשרת למכור דירות ישירות לקהל יעד רחב."
          ]
        },
        {
          title: "שימוש ברשתות חברתיות",
          content: [
            "פייסבוק - פרסם את הדירה בקבוצות פייסבוק שעוסקות בנדל\"ן או קבוצות מכירה וקהילות מקומיות.",
            "אינסטגרם - אם יש לך עמוד אישי עם עוקבים רבים, שתף את פרטי הדירה שם.",
            "השתמש בחבריך או בקבוצות פייסבוק כדי לשתף את הפרסום ולהגדיל את החשיפה."
          ]
        }
      ],
      summary: "פרסום מוצלח דורש הכנה טובה, תמונות איכותיות, תיאור מקצועי ופרסום בפלטפורמות הנכונות. סבלנות, זמן והתארגנות יובילו למכירה מוצלחת."
    }
  },
  4: {
    title: "ניהול פגישות וסיורים",
    icon: <FaSearch className="h-8 w-8" />,
    description: "איך לקבוע פגישות עם קונים ולהציג את הדירה בצורה מקצועית",
    content: {
      intro: "כשהתחלת לקבל פניות מקונים פוטנציאליים, חשוב לנהל את התהליך בצורה מסודרת ומקצועית כדי ליצור רושם טוב ולמנוע אי-נעימויות.",
      sections: [
        {
          title: "קביעת פגישות עם קונים פוטנציאליים",
          content: [
            "הגדרת זמנים מראש - כשקונים פונים אליך, קבע איתם מראש זמן מתאים להצגת הדירה.",
            "תקשורת ברורה - וודא שהקונה מבין את הכתובת בצורה ברורה ואת פרטי הדירה.",
            "הזמנת כל הקונים הרלוונטיים - קבע פגישה עם כל קונה בנפרד, אבל אל תעמיס על עצמך."
          ]
        },
        {
          title: "איך להציג את הדירה בצורה מקצועית",
          content: [
            "קבלת פנים - היה אדיב ומסביר פנים, קבל את הקונה עם חיוך והראה לו את הדירה בצורה חיובית.",
            "הסבר כללי על הדירה - ספר על הגודל הכולל, כמה חדרים יש, מצב הדירה, והמאפיינים הייחודיים.",
            "הצגת כל חדר בנפרד - הסבר על גודלו, מה היתרונות של כל חדר, האם יש בו אחסון ומה מצבו.",
            "הסברים על המיקום והסביבה - תחבורה ציבורית, שירותים ציבוריים קרובים, הסביבה הכללית."
          ]
        },
        {
          title: "התמודדות עם שאלות ודאגות",
          content: [
            "היה מוכן לענות על כל שאלה בצורה ישירה ובמהלך הסיור.",
            "אם יש בעיות מסוימות עם הדירה, כדאי להודות בכך ולהסביר כיצד אפשר לתקן או לשדרג את המצב.",
            "הקשב לצרכים ולדאגות של הקונה - זה יכול לעזור לך להתאים את ההצגה לצרכים שלו."
          ]
        },
        {
          title: "סיום הסיור והמשך התהליך",
          content: [
            "בסיום הסיור, אם הקונה מראה עניין בדירה, הצע לו לחשוב על הצעת מחיר אם הוא מעוניין.",
            "הסבר על שלבי מכירה נוספים - איך תוכל להגיע להסכמים על המחיר ואיך לתכנן את המעבר.",
            "היה זמין לשאלות גם אחרי סיום הסיור ולענות על כל שאלה שיש להם."
          ]
        },
        {
          title: "מעקב אחרי הפגישה",
          content: [
            "לאחר הפגישה, יצור קשר עם הקונים כדי לדעת אם יש להם שאלות נוספות.",
            "בדוק אם הם מעוניינים להמשיך בתהליך ולהתחיל בשלב הבא.",
            "אם הקונים מעוניינים בהצעה רשמית, היערך לשלוח להם את כל המידע הנדרש."
          ]
        }
      ],
      summary: "ניהול מקצועי של הפגישות והסיורים יוצר רושם טוב, מגדיל את הסיכוי לעסקה מוצלחת ומבטיח שכל הצדדים מרגישים בנוח עם התהליך."
    }
  },
  5: {
    title: "משא ומתן על מחיר",
    icon: <FaHandshake className="h-8 w-8" />,
    description: "איך לנהל משא ומתן עם קונים על המחיר תוך שמירה על מקצועיות",
    content: {
      intro: "משא ומתן על מחיר הדירה דורש הכנה מראש, סבלנות ויכולת להישאר רגוע תחת לחץ. המטרה היא להגיע לעסקה שמספקת את שני הצדדים.",
      sections: [
        {
          title: "הכנה למשא ומתן",
          content: [
            "הכר את המחיר שלך - דע מה המחיר המבוקש שלך לדירה ולמה. עשה מחקר שוק ובדוק מחירים דומים באזור.",
            "הגדרת טווח המחירים - היה ברור לגבי טווח המחירים שמקובל עליך. מה המחיר המינימלי שאתה מוכן לקבל?",
            "הכנה לתרחישים אפשריים - התכונן לתגובות שונות מצד הקונה ודע איך להגיב אם הקונה יציע הצעה נמוכה מאוד."
          ]
        },
        {
          title: "ניהול המשא ומתן",
          content: [
            "הקשר הראשוני - שמור על גישה אדיבה ופתוחה. אל תמהר להוריד את המחיר ברגע הראשון.",
            "הקשבה לקונה - הקשב לצרכים ולדאגות של הקונה. זה יכול לעזור לך לקבל החלטה האם להוריד את המחיר.",
            "הסבר על ערך הדירה - הסבר לקונה את הערך של הדירה: המיקום, הגודל, המצב, והשדרוגים שעשית.",
            "הציע מחיר גמיש - במקום להוריד מיד את המחיר, הצע מחיר גמיש עם תנאים."
          ]
        },
        {
          title: "קבלת הצעה ממולחת",
          content: [
            "לא לקבל הצעה מיידית - אם הקונה מציע מחיר נמוך מדי, אל תענה מיד. בקש ממנו להסביר את ההצעה.",
            "הכנה לפשרה - אם אתה פתוח לירידת מחירים, הצע פשרה שיכולה להתאים לשני הצדדים.",
            "הסביר את מחיר הדירה - אם אתה לא מוכן לרדת במחיר, הסבר לקונה למה המחיר שלך סביר ומוצדק."
          ]
        },
        {
          title: "סגירת העסקה",
          content: [
            "קבע את המחיר הסופי - אם הקונה מסכים למחיר או מציע פשרה, ודא שאתה מסכים למחיר הסופי.",
            "הסכם ברור - ברגע שיש הסכמה על המחיר, התחיל להכין את הסכמי המכירה.",
            "תיאום תהליך המעבר - קבע את מועד ההעברה וחתימת החוזה והיו מוכנים לסיים את כל התהליך בצורה מסודרת."
          ]
        }
      ],
      summary: "משא ומתן מוצלח דורש הכנה טובה, הקשבה לקונה, הסבר על ערך הדירה, וגמישות מבוקרת. הישאר רגוע ומקצועי לאורך כל התהליך."
    }
  },
  6: {
    title: "חתימת חוזה ועורך דין",
    icon: <FaFileContract className="h-8 w-8" />,
    description: "מה תפקידו של עורך הדין בעת חתימת חוזה מכירת דירה",
    content: {
      intro: "עורך הדין המייצג את המוכר במכירת הדירה מבצע תהליך חשוב מאוד על מנת להבטיח שהמכירה תתנהל בצורה חוקית, מסודרת ובטוחה.",
      sections: [
        {
          title: "בדיקות ראשוניות לפני חתימת החוזה",
          content: [
            "בדיקת בעלות הדירה - עורך הדין בודק במרשם המקרקעין (טאבו) שהמוכר הוא הבעלים החוקי של הדירה ושיש לו זכות למכור אותה.",
            "בדיקות תכנוניות - בודק אם יש בעיות תכנוניות עם הדירה, כמו חריגות בנייה או תוכניות בנייה עתידיות באזור.",
            "בדיקת רישומים וחובות - בודק אם יש חובות או תשלומים המוטלים על הדירה, כמו תשלומי ארנונה שלא שולמו.",
            "בדיקת הרגולציה המקומית - וודא שהדירה אכן עומדת בדרישות החוק המקומי ושהיא לא נתונה למגבלות."
          ]
        },
        {
          title: "ניסוח ועריכת החוזה",
          content: [
            "הכנת החוזה - עורך הדין מכין את חוזה המכירה על בסיס התנאים שהוסכמו בין הצדדים.",
            "הגנה על המוכר - דואג לוודא שהחוזה מגן על המוכר באופן מלא ושיהיו מנגנונים ברורים במקרה של הפרת החוזה.",
            "תנאים כלליים וספציפיים - החוזה כולל את התנאים הספציפיים לעסקה כדי למנוע חיכוכים בהמשך."
          ]
        },
        {
          title: "הצגת החוזה למוכר ולקונה",
          content: [
            "הסבר על החוזה למוכר - עורך הדין ישב עם המוכר ויבצע לו הסבר מלא על כל הסעיפים בחוזה.",
            "הסבר לקונה על החוזה - וודא שכל צד מבין את החוזה באופן ברור ואת כל התנאים וההתחייבויות.",
            "חתימה על החוזה - ברגע שהחוזה מובן ומוסכם על שני הצדדים, החוזה יהפוך למסמך מחייב."
          ]
        },
        {
          title: "ביצוע פעולות נוספות לאחר חתימת החוזה",
          content: [
            "העברת הבעלות בטאבו - עורך הדין מבצע את העברת הבעלות במרשם המקרקעין.",
            "הסדרת כל התשלומים - דואג לכך שהתשלומים יתבצעו כפי שסוכם בחוזה.",
            "הסדרת חובות וחשבונות - וודא שחובות על הדירה יוסרו ושהתשלומים לא יישארו פתוחים.",
            "סיום העסקה - וודא שכל מסמך נדרש הושלם ושהמוכר קיבל את התמורה המלאה עבור הדירה."
          ]
        }
      ],
      summary: "עורך הדין מוודא שהמוכר יכול למכור את הדירה בצורה מסודרת ובטוחה, ושלא ייווצרו בעיות בהמשך. הוא מבצע בדיקות מקדמיות, מנסח את החוזה, מסביר את התנאים ומבצע את העברת הבעלות."
    }
  }
};

export default async function SellerGuidePage({ params }) {
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
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
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
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
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stepNumber / 6) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-500">
                {Math.round((stepNumber / 6) * 100)}%
              </span>
              <Link
                href="/seller/faq"
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
              <div key={index} className="border-r-4 border-blue-500 pr-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start">
                      <FaCheckCircle className="h-5 w-5 text-blue-500 mt-0.5 ml-3 flex-shrink-0" />
                      <p className="text-gray-700 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <FaClock className="h-5 w-5 ml-2" />
              סיכום השלב
            </h3>
            <p className="text-blue-800 leading-relaxed">
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
                href={`/seller/${prevStep}`}
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
                href={`/seller/${step}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === stepNumber
                    ? 'bg-blue-600 text-white'
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
                href={`/seller/${nextStep}`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
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
                href={`/seller/${step}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === stepNumber
                    ? 'bg-blue-600 text-white'
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
                  href={`/seller/${prevStep}`}
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
                  href={`/seller/${nextStep}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
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