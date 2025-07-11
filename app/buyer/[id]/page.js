import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaCalculator, FaUniversity, FaSearch, FaHome, FaGavel, FaFileContract, FaArrowRight, FaArrowLeft, FaClock, FaCheckCircle, FaArrowCircleLeft, FaArrowCircleRight, FaQuestionCircle } from 'react-icons/fa';

// מידע השלבים
const steps = {
  1: {
    title: "הכנה פיננסית ובדיקת כושר אשראי",
    icon: <FaCalculator className="h-8 w-8" />,
    description: "הערכת יכולת המימון האישית והכנת המסמכים הפיננסיים",
    content: {
      intro: "לפני שאתם פונים לבנק בבקשה למשכנתא, יש לבצע הכנה ראשונית. הכנה זו תעזור לכם להבין את היכולות הפיננסיות שלכם ולהגביר את סיכוייכם לקבל אישור למשכנתא.",
      sections: [
        {
          title: "הערכת יכולת המימון האישית",
          content: [
            "חשוב לדעת כמה כסף אתם יכולים להוציא על דירה, תוך שקלול ההכנסות, ההוצאות, והחובות הקיימים.",
            "בדקו את ההכנסה החודשית הקבועה שלכם מכל המקורות.",
            "רשמו את כל ההוצאות החודשיות הקבועות שלכם.",
            "חשבו את יתרת הכסף החופשי שיכולה להיות מוקדשת לתשלום משכנתא."
          ]
        },
        {
          title: "הגדרת ההון העצמי",
          content: [
            "כמה כסף יש לכם לחסכון? ברוב המקרים, עליכם להציג הון עצמי של לפחות 25%-30% ממחיר הדירה.",
            "ההון העצמי תלוי בסוג הדירה ובתנאים האישיים שלכם.",
            "קחו בחשבון שמלבד ההון העצמי, תצטרכו כסף נוסף להוצאות נלוות כמו עורך דין, מס רכישה ושיפוצים.",
            "ודאו שהחיסכון שלכם נגיש ולא קשור להשקעות ארוכות טווח."
          ]
        },
        {
          title: "הכנת כל המסמכים הפיננסיים",
          content: [
            "תלושי שכר (בדרך כלל 3-6 חודשים אחרונים) - ודאו שהם עדכניים וברורים.",
            "דפי חשבון בנק (לרוב 3-6 חודשים אחרונים) - הראו יציבות פיננסית.",
            "דוחות מס הכנסה (אם יש הכנסות נוספות לא דרך תלושי שכר).",
            "אישורים על חובות קיימים (כגון הלוואות, כרטיסי אשראי, הלוואות סטודנט)."
          ]
        },
        {
          title: "הבנת יכולת ההחזר החודשית",
          content: [
            "עליכם לחשוב גם על סכום ההחזר החודשי שאתם יכולים לעמוד בו לאורך זמן.",
            "מדובר בתשלום החודשי לבנק, שהוא לרוב כשליש מההכנסה החודשית שלכם.",
            "חשבו גם על הוצאות נוספות שיגיעו עם הדירה: ארנונה, ועד בית, ביטוח וחשמל.",
            "השאירו מרווח פיננסי למקרים חירום או שינויים בהכנסה."
          ]
        }
      ],
      summary: "הכנה פיננסית יסודית היא הבסיס להצלחה בתהליך רכישת הדירה. ככל שתהיו מוכנים יותר, כך תקבלו תנאים טובים יותר מהבנק ותוכלו לקבל החלטות מושכלות."
    }
  },
  2: {
    title: "קבלת אישור עקרוני למשכנתא",
    icon: <FaUniversity className="h-8 w-8" />,
    description: "פנייה לבנק, בדיקת יכולת החזר וקבלת אישור למשכנתא",
    content: {
      intro: "לאחר שתעשו את ההכנות הבסיסיות, תוכלו לפנות לבנק. הבנקים מבצעים בדיקה מקיפה של מצבכם הפיננסי לפני שהם מסכימים להעניק לכם משכנתא.",
      sections: [
        {
          title: "פגישה עם יועץ משכנתאות",
          content: [
            "ברוב הבנקים קיימים יועצים שיכולים לעזור לכם להבין את הצרכים שלכם ולהמליץ לכם על תוכנית משכנתא.",
            "יועץ המשכנתא יעזור לכם לחשב את גובה המשכנתא שאתם יכולים לקבל.",
            "הוא יסביר על פריסת ההחזר, הריבית הצפויה, וסוגי הלוואות המשכנתא.",
            "תוכלו לבחור בין משכנתא צמודה לדולר/שקל, משתנה/קבועה בהתאם למצבכם."
          ]
        },
        {
          title: "הגשת בקשה למשכנתא",
          content: [
            "במהלך הפגישה, תצטרכו למלא טופס בקשה למשכנתא עם המידע הפיננסי שלכם.",
            "הבנק יבקש מכם להמציא את המסמכים שהכנתם בשלב הקודם.",
            "ודאו שכל המידע מדויק ועדכני - טעויות יכולות לעכב את התהליך.",
            "שאלו שאלות על תנאי ההלוואה, עמלות ועלויות נוספות."
          ]
        },
        {
          title: "בדיקת יכולת ההחזר וקביעת תנאים",
          content: [
            "הבנק מחשב את שיעור התשלום החודשי המתאים לכם.",
            "בדרך כלל, הבנק לא יאפשר לכם להוציא יותר משליש מההכנסה החודשית על תשלום ההחזר.",
            "הבנק יבדוק את היציבות הכלכלית שלכם ובעיות תשלום קודמות.",
            "יבוצע בדיקת אשראי מפורטת כדי להעריך את רמת הסיכון שלכם."
          ]
        },
        {
          title: "קבלת אישור עקרוני למשכנתא",
          content: [
            "אישור עקרוני הוא אישור ראשוני שאתם זכאים לקבל את המשכנתא מהבנק, תחת תנאים מסוימים.",
            "האישור יכלול את סכום ההלוואה, הריבית הצפויה, ופריסת ההחזר.",
            "זהו שלב קריטי - עם האישור תוכלו להמשיך עם תהליך חיפוש והרכישה.",
            "האישור בדרך כלל תקף למספר חודשים, אז תכננו את הצעדים הבאים בהתאם."
          ]
        }
      ],
      summary: "קבלת אישור עקרוני למשכנתא נותנת לכם ביטחון פיננסי ואמינות מול מוכרים. זהו צעד הכרחי לפני תחילת חיפוש דירה רציני."
    }
  },
  3: {
    title: "חיפוש דירה והגדרת קריטריונים",
    icon: <FaSearch className="h-8 w-8" />,
    description: "הגדרת דרישות, תקציב ומיקום, וחיפוש דירה בפלטפורמות השונות",
    content: {
      intro: "שלב זה מאוד חשוב בתהליך הרכישה. אחרי שקיבלתם אישור עקרוני למשכנתא, אתם יכולים להתחיל לחפש דירה בצורה ממוקדת ויעילה.",
      sections: [
        {
          title: "הגדרת תקציב מדויק",
          content: [
            "כעת, אחרי קבלת האישור העקרוני למשכנתא, יש לך מושג ברור לגבי התקציב שלך.",
            "חשוב לזכור שעלות הדירה צריכה להתאים ליכולת ההחזר החודשית שלך.",
            "קחו בחשבון את עלויות מס הרכישה (בין 3.5%-10% בהתאם לנסיבות).",
            "הוסיפו הוצאות עורך דין (1.5%-2% מערך הדירה), ועלויות שיפוצים אפשריים."
          ]
        },
        {
          title: "קביעת מיקום מתאים",
          content: [
            "חשוב לקבוע את האזור שבו תרצו לרכוש דירה בהתאם לצרכים שלכם:",
            "האם אתם מעדיפים אזור מרכזי או שכונה שקטה יותר?",
            "בדקו קרבה לתחבורה ציבורית, לבתי ספר, למרכזי קניות או לעבודה.",
            "חקרו את פוטנציאל הפיתוח של האזור - האם המחירים צפויים לעלות?",
            "בדקו אם יש תוכניות בנייה עתידיות שעלולות להשפיע על איכות החיים."
          ]
        },
        {
          title: "הגדרת סוג הדירה והדרישות",
          content: [
            "החליטו איזה סוג דירה אתם מחפשים: מספר חדרים, גודל, סוג מבנה.",
            "האם אתם מחפשים דירה חדשה מקבלן או דירה יד שנייה?",
            "רשמו דרישות חובה: חניה, מעלית, מרפסת, כיוון דירה.",
            "הגדירו דרישות רצויות שתוכלו להתפשר עליהן במידת הצורך."
          ]
        },
        {
          title: "פלטפורמות חיפוש דירות",
          content: [
            "יד2 (Yad2) - האתר הגדול ביותר בישראל, עם מגוון רחב של דירות ואפשרויות סינון מתקדמות.",
            "מדלן - אתר המתמקד בנדל\"ן עם כלים לניתוח שווי ומידע על שוק.",
            "הומלס - פלטפורמה נוספת עם דירות פרטיות ומקבלנים.",
            "קבוצות פייסבוק מקומיות - לעיתים מוצאים דילים טובים שלא מתפרסמים באתרים הגדולים.",
            "השתמשו בתנאי חיפוש מתקדמים לסינון לפי מחיר, מיקום, מספר חדרים וקומה."
          ]
        }
      ],
      summary: "חיפוש ממוקד וחכם יחסוך לכם זמן ויביא אתכם לדירה המתאימה. הגדרת קריטריונים ברורים ושימוש נכון בפלטפורמות החיפוש הם המפתח להצלחה."
    }
  },
  4: {
    title: "ביקור בדירות ובדיקות מעמיקות",
    icon: <FaHome className="h-8 w-8" />,
    description: "ביקור בדירות, בדיקת מצב פיזי ובדיקות משפטיות ראשוניות",
    content: {
      intro: "לאחר שמצאתם דירות שמעניינות אתכם, הגיע הזמן לראות אותן בשטח ולבדוק אותן לעומק. זהו שלב קריטי שבו אתם בודקים האם הדירה באמת מתאימה לכם.",
      sections: [
        {
          title: "הכנה לביקור בדירות",
          content: [
            "קבעו פגישות עם המוכרים או נציגיהם בזמנים נוחים לכם.",
            "הכינו רשימת שאלות מראש על הדירה, השכונה, וההוצאות.",
            "קחו איתכם מטר למדידות ורשמו הערות על כל דירה שאתם מבקרים.",
            "אם אפשר, בקרו בדירה בשעות שונות ביום כדי להבין את האופי של השכונה."
          ]
        },
        {
          title: "בדיקת מצב הדירה הפיזי",
          content: [
            "בדקו את מצב הקירות, הריצוף, החלונות והדלתות.",
            "בחנו את מערכת החשמל, הצנרת ומערכת החימום.",
            "שימו לב לרטיבות, סדקים בקירות או בעיות אחרות שעלולות לדרוש תיקון יקר.",
            "אם מדובר בדירה ישנה, בדקו האם יש צורך בשיפוצים משמעותיים.",
            "בחנו את כיוון הדירה, כמות האור הטבעי, ואת הנוף מהחלונות."
          ]
        },
        {
          title: "שאלות חשובות למוכר",
          content: [
            "למה הדירה נמכרת? - התשובה יכולה לחשוף בעיות פוטנציאליות.",
            "האם יש חובות או בעיות עם הדירה? (עיקולים, חובות, תביעות)",
            "מה ההוצאות החודשיות? (ארנונה, ועד בית, מים, חשמל)",
            "האם יש תוכניות לפיתוח עתידי באזור שעלולות להשפיע על איכות החיים?",
            "מה מצב השכנים והבנין? האם יש בעיות או מחלוקות?"
          ]
        },
        {
          title: "בדיקות ראשוניות משפטיות ומנהליות",
          content: [
            "ודאו שהמוכר הוא הבעלים החוקי של הדירה.",
            "בקשו לראות את תעודת הזכויות על הדירה.",
            "בדקו שאין חובות פתוחים לארנונה או לועד הבית.",
            "ודאו שאין תביעות משפטיות או סכסוכים על הנכס.",
            "אם יש ועד בית, בדקו את המצב הפיננסי של הועד ותוכניות עתידיות."
          ]
        },
        {
          title: "הערכת שווי ראשונית",
          content: [
            "השוו את מחיר הדירה לדירות דומות באזור.",
            "קחו בחשבון את עלות השיפוצים הנדרשים.",
            "ודאו שהמחיר הוגן ביחס לשוק הנוכחי.",
            "שקלו לפנות לשמאי מקרקעין להערכה מקצועית אם אתם לא בטוחים."
          ]
        }
      ],
      summary: "ביקור יסודי בדירות ובדיקות מעמיקות יחסכו לכם כסף ובעיות בעתיד. השקיעו זמן בשלב זה - זו החלטה שתשפיע עליכם שנים רבות."
    }
  },
  5: {
    title: "עבודה עם עורך דין ובדיקות משפטיות",
    icon: <FaGavel className="h-8 w-8" />,
    description: "חשיבות עורך דין מומחה במקרקעין ותהליך הבדיקות המשפטיות",
    content: {
      intro: "עסקת נדל\"ן חייבת להתבצע דרך עורך דין שמתמחה במקרקעין. זהו תהליך מקצועי ומורכב שדורש ידע משפטי מעמיק ועדכני.",
      sections: [
        {
          title: "למה חשוב עורך דין מומחה במקרקעין",
          content: [
            "התחום של מקרקעין דורש ידע משפטי מעמיק ומתעדכן כל הזמן.",
            "עסקה במקרקעין היא אחת מהעסקאות הגדולות והחשובות ביותר בחיים.",
            "עורך דין כללי עלול להחמיץ פרטים חשובים שיכולים לגרום לבעיות חמורות.",
            "מומחה במקרקעין מכיר את כל החוקים והתקנות הרלוונטיים (חוק המקרקעין, הגנת הדייר, תמא 38).",
            "הוא מסוגל לזהות סיכונים משפטיים ולמנוע בעיות עתידיות."
          ]
        },
        {
          title: "בדיקות ראשוניות שעורך הדין מבצע",
          content: [
            "בדיקת בעלות הדירה ברישומי הטאבו - ודא שהמוכר הוא הבעלים החוקי.",
            "בדיקת עיקולים, שיעבודים ותביעות על הנכס.",
            "בדיקת היתרי בנייה ותכניות עתידיות באזור.",
            "בדיקת חובות ארנונה, ועד בית ותשלומים אחרים.",
            "בדיקת המצב המשפטי של השכונה והבנין."
          ]
        },
        {
          title: "היתרונות של עורך דין מומחה",
          content: [
            "הבנה עמוקה של החוקים והתקנות בתחום המקרקעין.",
            "הכרת התהליכים המשפטיים של רכישת דירה.",
            "ביצוע בדיקות מעמיקות על הנכס למניעת בעיות עתידיות.",
            "ניסיון בניהול סיכונים משפטיים וביטחון העסקה.",
            "יכולת לנהל משא ומתן מקצועי עם הצד השני.",
            "הכרת השוק המקומי וההתפתחויות החדשות."
          ]
        },
        {
          title: "מה קורה אם לא משתמשים במומחה",
          content: [
            "עורך דין לא מומחה עלול להחמיץ בעיות משפטיות חמורות.",
            "סיכון לבעיות ברישום הנכס או בעברת הבעלות.",
            "אפשרות לגילוי עיקולים או חובות רק לאחר המכירה.",
            "בעיות פוטנציאליות עם חוזים, זכויות שימוש ותביעות.",
            "חשיפה לסיכונים פיננסיים ומשפטיים שיכולים לעלות הרבה כסף."
          ]
        }
      ],
      summary: "השקעה בעורך דין מומחה במקרקעין היא השקעה בביטחון שלכם. זו לא הוצאה אלא ביטוח למניעת בעיות שיכולות לעלות הרבה יותר כסף בעתיד."
    }
  },
  6: {
    title: "חתימת חוזה והשלמת העסקה",
    icon: <FaFileContract className="h-8 w-8" />,
    description: "תהליך חתימת החוזה, העברת כספים והשלמת רכישת הדירה",
    content: {
      intro: "זהו השלב האחרון והקריטי ביותר בתהליך רכישת הדירה. עורך הדין מבצע את כל הפעולות המשפטיות הנדרשות להבטחת רכישה בטוחה וחוקית.",
      sections: [
        {
          title: "ניסוח ועריכת החוזה",
          content: [
            "עורך הדין יוודא שהחוזה מכיל את כל התנאים החשובים: מחיר, תנאי תשלום, מועדים.",
            "הוא יבדוק שכל התנאים הוגנים ומקובלים על הקונה.",
            "החוזה יכלול סעיפי הגנה מפני בעיות עתידיות ותנאי ביטול.",
            "יוודא שלא מופיעים סעיפים שמעמידים את הקונה בסיכון לא נדרש.",
            "הוסיפו תנאים משפטיים חשובים כמו התמודדות עם עיקולים או בעיות פיזיות."
          ]
        },
        {
          title: "תיאום התשלום והעברת כספים",
          content: [
            "עורך הדין יוודא שהכספים מועברים בצורה מסודרת דרך חשבון נאמנות.",
            "הוא ידאג לתשלום מס הרכישה במועד ובצורה הנכונה.",
            "יוודא שהקונה לא ישלם את יתרת הסכום עד שהמוכר עמד בכל התנאים.",
            "ינהל את התיאום עם הבנק להעברת כספי המשכנתא.",
            "יוודא שכל התשלומים מתועדים ומבוצעים על פי החוק."
          ]
        },
        {
          title: "חתימת החוזה",
          content: [
            "עורך הדין יסביר לקונה את כל התנאים בחוזה לפני החתימה.",
            "הוא יבהיר כל סעיף לא ברור ויתקן בעיות אם נדרש.",
            "יוודא שכל הצדדים מבינים את משמעות החתימה והתחייבויותיהם.",
            "ישמור עותקים של החוזה ויוודא שהקונה מקבל את העותק שלו.",
            "יתעד את כל התהליך באופן מקצועי ומדויק."
          ]
        },
        {
          title: "השלמת העסקה והעברת הבעלות",
          content: [
            "עורך הדין ידאג להעביר את הבעלות לרישום בטאבו על שם הקונה.",
            "הוא יוודא שהקונה שילם את מס הרכישה בזמן למניעת קנסות.",
            "ינהל את מסירת הדירה ויוודא שהמוכר עמד בכל התחייבויותיו.",
            "יבדוק שכל המסמכים הושלמו ונחתמו כנדרש.",
            "יספק לקונה את כל המסמכים הרלוונטיים לבעלות על הדירה."
          ]
        },
        {
          title: "שלבים אחרונים וסיום התהליך",
          content: [
            "וידוא שהדירה נרשמה על שם הקונה במרשם המקרקעין.",
            "קבלת תעודת זכויות חדשה על שם הקונה.",
            "העברת פוליסות ביטוח והסכמי שירותים על שם הבעלים החדש.",
            "מסירת מפתחות והחזקה בפועל בדירה.",
            "עדכון כל הגורמים הרלוונטיים על שינוי הבעלות."
          ]
        }
      ],
      summary: "השלמת העסקה באופן מקצועי ומדויק מבטיחה שתקבלו את הדירה ללא בעיות משפטיות. עורך הדין הוא השותף שלכם להבטחת רכישה בטוחה וחוקית."
    }
  }
};

export default async function BuyerGuidePage({ params }) {
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
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
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
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
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
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stepNumber / 6) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-500">
                {Math.round((stepNumber / 6) * 100)}%
              </span>
              <Link
                href="/buyer/faq"
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
              <div key={index} className="border-r-4 border-green-500 pr-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start">
                      <FaCheckCircle className="h-5 w-5 text-green-500 mt-0.5 ml-3 flex-shrink-0" />
                      <p className="text-gray-700 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
              <FaClock className="h-5 w-5 ml-2" />
              סיכום השלב
            </h3>
            <p className="text-green-800 leading-relaxed">
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
                href={`/buyer/${prevStep}`}
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
                href={`/buyer/${step}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === stepNumber
                    ? 'bg-green-600 text-white'
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
                href={`/buyer/${nextStep}`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
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
                href={`/buyer/${step}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === stepNumber
                    ? 'bg-green-600 text-white'
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
                  href={`/buyer/${prevStep}`}
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
                  href={`/buyer/${nextStep}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
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