import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaCalculator, FaSearch, FaHome, FaFileContract, FaKey, FaHandshake, FaArrowRight, FaArrowLeft, FaClock, FaCheckCircle, FaArrowCircleLeft, FaArrowCircleRight, FaQuestionCircle } from 'react-icons/fa';

// מידע השלבים
const steps = {
  1: {
    title: "הכנה ראשונית והגדרת תקציב",
    icon: <FaCalculator className="h-8 w-8" />,
    description: "הגדרת תקציב, צרכים אישיים והכנה לתהליך השכירות",
    content: {
      intro: "לפני שאתה מתחיל לחפש דירה להשכרה, חשוב להבין את הצרכים שלך ולהיות מוכן להתמודד עם תהליך השכירות בצורה מסודרת.",
      sections: [
        {
          title: "הגדרת תקציב חודשי נכון",
          content: [
            "הגדר כמה כסף אתה יכול להוציא כל חודש על שכר דירה - ההמלצה היא לא יותר מ-30%-40% מההכנסה החודשית.",
            "חשב גם הוצאות נוספות: ארנונה, חשמל, מים, אינטרנט, דמי ועד בית - זה יכול להוסיף 15%-25% לעלות החודשית.",
            "השאר מרווח פיננסי לעלויות חירום וחג פתח הבית (פיקדון, מקדמה, עלויות מעבר).",
            "תכנן לפחות 3-4 חודשי שכירות בחסכון (פיקדון + מקדמה + חודש ראשון + חירום)."
          ]
        },
        {
          title: "הגדרת דרישות מיקום",
          content: [
            "קבע קרבה לעבודה או ללימודים - חשב זמן נסיעה ועלות תחבורה יומית.",
            "בדוק זמינות תחבורה ציבורית באזור - אוטובוסים, רכבת, תדירות בשעות השונות.",
            "שקול קרבה לשירותים חיוניים: סופרמרקט, בנק, מרפאה, בית מרקחת.",
            "בדוק את איכות השכונה: רמת רעש, ביטחון, נקיון ואווירה כללית."
          ]
        },
        {
          title: "הגדרת גודל ומאפייני הדירה",
          content: [
            "קבע כמה חדרים אתה צריך - שים לב שסלון יכול לשמש כחדר שינה נוסף.",
            "החלט אם אתה מעוניין בדירה מרוהטת או לא מרוהטת (השפיע על התקציב הראשוני).",
            "רשום מאפיינים חיוניים: מעלית (במיוחד בקומות גבוהות), חניה, מרפסת.",
            "שקול צרכים עתידיים - האם הדירה מתאימה לטווח הארוך או לשינויים בחיים?"
          ]
        },
        {
          title: "הכנת מסמכים נדרשים",
          content: [
            "הכן תלושי שכר מ-3 החודשים האחרונים להוכחת יכולת פיננסית.",
            "הכן אישור עבודה או מכתב מהמעסיק על היקף המשרה והשכר.",
            "צלם תעודת זהות, אישור חשבון בנק ופרטי קשר של ערבים פוטנציאליים.",
            "הכן המלצות מבעלי דירה קודמים או מעסיקים כהוכחה לאמינות."
          ]
        }
      ],
      summary: "הכנה יסודית תעזור לך למצוא את הדירה המתאימה במהירות ותגדיל את הסיכויים שבעלי דירה יסכימו להשכיר לך. ככל שתהיה מוכן יותר, כך התהליך יהיה חלק יותר."
    }
  },
  2: {
    title: "חיפוש דירה וקביעת קריטריונים",
    icon: <FaSearch className="h-8 w-8" />,
    description: "חיפוש יעיל בפלטפורמות, סינון והכנה לביקורים",
    content: {
      intro: "עכשיו כשאתה יודע מה אתה מחפש ומה התקציב שלך, הגיע הזמן לחפש דירה באופן יעיל ומקצועי.",
      sections: [
        {
          title: "פלטפורמות חיפוש יעילות",
          content: [
            "יד2 - הפלטפורמה הגדולה ביותר, עם אפשרויות סינון מתקדמות לפי מיקום, מחיר וגודל.",
            "פייסבוק מרקטפלייס וקבוצות מקומיות - לעיתים יש דירות שלא מפורסמות במקומות אחרים.",
            "מדלן - פלטפורמה נוספת עם מידע מפורט על השכונות ושוק השכירות.",
            "אפליקציות מובייל כמו HomeDash או Yango - עדכונים מיידיים על דירות חדשות.",
            "לוחות מודעות פיזיים ברחובות של השכונות המעניינות אותך."
          ]
        },
        {
          title: "שימוש בסינון חכם",
          content: [
            "הגדר טווח מחירים ריאלי - לא רק המקסימום אלא גם מינימום להימנע מדירות בעייתיות.",
            "סנן לפי מיקום מדויק - שכונות או רחובות ספציפיים, לא רק עיר כללית.",
            "הגדר פרמטרים נדרשים: מספר חדרים, קומה (אם חשוב), תאריך פינוי.",
            "השתמש במילות מפתח ספציפיות: 'מרוהט', 'מעלית', 'חניה', 'מיידי'."
          ]
        },
        {
          title: "יצירת רשימת מועמדים",
          content: [
            "צור רשימה של 10-15 דירות שמעניינות אותך ורשום עליהן הערות.",
            "דרג אותן לפי עדיפויות - מה חובה ומה רצוי.",
            "בדוק בכל דירה: תמונות איכותיות, תיאור מפורט, פרטי קשר ברורים.",
            "שים לב לדירות שמפורסמות כבר זמן רב - יכול להעיד על בעיה."
          ]
        },
        {
          title: "אסטרטגיית פנייה למשכירים",
          content: [
            "הכן הודעה קצרה ומקצועית המציגה אותך: גיל, עבודה, סטטוס משפחתי.",
            "פנה למספר דירות בו זמנית - השוק זז מהר ויש תחרות.",
            "הזכר שאתה מוכן לביקור מיידי ושיש לך את כל המסמכים מוכנים.",
            "שאל שאלות נכונות: מתי אפשר לבקר, מה כלול בשכירות, איך תהליך האישור."
          ]
        }
      ],
      summary: "חיפוש יעיל דורש אסטרטגיה ומקצועיות. ככל שתהיה יותר מאורגן ומהיר בתגובות, כך הסיכויים שלך לקבל את הדירה הטובה יהיו גבוהים יותר."
    }
  },
  3: {
    title: "ביקור בדירות ופגישה עם המשכיר",
    icon: <FaHome className="h-8 w-8" />,
    description: "בדיקת הדירה, שאלות נכונות והתרשמות מהמשכיר",
    content: {
      intro: "זהו השלב הקריטי שבו אתה פוגש את המשכיר ובודק את הדירה מקרוב. הכנה טובה תעזור לך לקבל החלטה נכונה ולהשאיר רושם טוב.",
      sections: [
        {
          title: "הכנה לפגישה עם המשכיר",
          content: [
            "הגע בזמן ולבוש בצורה מכובדת - רושם ראשוני חשוב מאוד.",
            "הכן רשימת שאלות מראש ופנקס להערות.",
            "קח איתך את כל המסמכים הנדרשים במקרה שהמשכיר רוצה לראות.",
            "אם אפשר, בקר בדירה בשעות יום לראות אור טבעי ופעילות השכונה."
          ]
        },
        {
          title: "בדיקת מצב הדירה הפיזי",
          content: [
            "בדוק את הקירות - חפש סדקים, רטיבות או כתמים החשידים על בעיות.",
            "נסה את כל הברזים, מתגי החשמל והתאורה - וודא שהכל עובד.",
            "בדוק את מצב החלונות והדלתות - האם הן נסגרות היטב ויש בהן אטימות טובה.",
            "שים לב למערכת החימום/מיזוג - איך היא עובדת ומה עלויות ההפעלה.",
            "אם הדירה מרוהטת, בדוק מצב הריהוט והמכשירים החשמליים."
          ]
        },
        {
          title: "שאלות חיוניות למשכיר",
          content: [
            "מה בדיוק כלול בדמי השכירות? (חשמל, מים, ארנונה, ועד בית, אינטרנט)",
            "כמה הפיקדון ומתי הוא מוחזר? מה התנאים להחזרה מלאה?",
            "מה המדיניות לגבי תיקונים ותחזוקה? מי משלם עבור מה?",
            "האם מותר לעשות שינויים קטנים בדירה (תליית תמונות, צביעה)?",
            "מה הזמינות וכמה זמן יש לקבל החלטה?"
          ]
        },
        {
          title: "הערכת הסביבה והבניין",
          content: [
            "הסתכל על מצב הבניין, חדר המדרגות והכניסה הראשית.",
            "שאל על השכנים - האם הם שקטים, האם יש בעיות משותפות.",
            "בדוק את אפשרויות החניה - האם יש מקום קבוע או צריך לחפש ברחוב.",
            "שים לב לרמת הרעש בשעות השונות ולאבטחה באזור.",
            "בדוק קרבה לשירותים - תחבורה ציבורית, חנויות, מוסדות ציבור."
          ]
        },
        {
          title: "קבלת החלטה והמשך תהליך",
          content: [
            "אל תלחץ לקבל החלטה בביקור - בקש זמן לחשיבה (24-48 שעות סבירות).",
            "אם אתה מעוניין, הבע זאת בבירור ושאל מה השלבים הבאים.",
            "ברר מה המסמכים הנדרשים והאם צריך פגישה נוספת לחתימה.",
            "אם אתה לא מעוניין, הודה בצורה מנומסת ואל תשאיר את המשכיר במתח."
          ]
        }
      ],
      summary: "ביקור יסודי בדירה ופגישה מקצועית עם המשכיר הם הבסיס להחלטה נכונה. לא תמיד הדירה הראשונה שתראה תהיה הנכונה - שמור על סבלנות וביקורתיות בריאה."
    }
  },
  4: {
    title: "בדיקות משפטיות והכנה לחוזה",
    icon: <FaFileContract className="h-8 w-8" />,
    description: "הבנת זכויות וחובות, בדיקת תנאי החוזה ונושא הביטחונות",
    content: {
      intro: "לפני חתימת החוזה, חשוב להבין את כל ההיבטים המשפטיים ולוודא שהחוזה מגן על הזכויות שלך כשוכר.",
      sections: [
        {
          title: "הבנת הזכויות והחובות של השוכר",
          content: [
            "זכות לדירה באיכות ראויה למגורים ללא פגמים מסוכנים.",
            "זכות לפרטיות - המשכיר לא יכול להיכנס לדירה ללא תיאום מראש.",
            "חובה לשמור על הדירה במצב טוב ולדווח על בעיות בזמן.",
            "חובה לשלם את דמי השכירות בזמן ולעמוד בתנאי החוזה.",
            "זכות להודעה מוקדמת במקרה של סיום חוזה או העלאת שכירות."
          ]
        },
        {
          title: "בדיקת תנאי החוזה בפירוט",
          content: [
            "וודא שהחוזה כתוב ברור ומפרט את כל ההסכמות שהוחלטו בעל פה.",
            "בדוק שגובה השכירות, מועדי תשלום ותקופת השכירות מופיעים במדויק.",
            "ודא שרשומים כל התשלומים הנוספים ומי אחראי על כל הוצאה.",
            "בדוק תנאי סיום החוזה - הודעה מוקדמת, פיצויים, תנאי חידוש.",
            "ודא שמופיעים פרטי הצדדים המלאים ותאריכים מדויקים."
          ]
        },
        {
          title: "נושא הפיקדון והביטחונות",
          content: [
            "הפיקדון הסטנדרטי הוא 1-2 חודשי שכירות - וודא שהסכום הגיוני.",
            "דרוש קבלה על תשלום הפיקדון ובירור תנאי ההחזרה.",
            "הפיקדון צריך להיות מופקד בחשבון נפרד, לא בחשבון האישי של המשכיר.",
            "ברר מה מהמיינים מהפיקדון - בדרך כלל רק נזקים חריגים או חובות.",
            "התעקש על תיעוד מצב הדירה בכניסה למניעת מחלוקות בסוף."
          ]
        },
        {
          title: "סוגיית התיקונים והתחזוקה",
          content: [
            "בחוזה צריך להיות ברור מי אחראי על כל סוג תיקון - שוטף או חריג.",
            "בדרך כלל המשכיר אחראי על תיקונים מבניים ומכשירים שהיו בדירה.",
            "השוכר אחראי על נזקים שגרם, ברגע ובלאי רגיל.",
            "דרוש מספר טלפון לתקלות דחופות ובירור זמני תגובה.",
            "ודא שיש הסכמה על שיפורים שאתה רוצה לעשות בדירה."
          ]
        },
        {
          title: "נושאים מיוחדים לשים לב אליהם",
          content: [
            "בדוק אם יש הגבלות על אורחים, רעש או שימוש בדירה.",
            "ברר האם מותר להכניס חיות מחמד אם זה רלוונטי עבורך.",
            "ודא שאין סעיפי עלאת שכירות אוטומטית בלתי סבירה.",
            "בדוק האם יש אפשרות להאריך את החוזה ובאילו תנאים.",
            "שים לב לסעיפי ביטול או פיצויים - שהם הוגנים ויושמו על שני הצדדים."
          ]
        }
      ],
      summary: "הבנה מלאה של החוזה והזכויות שלך תמנע בעיות בעתיד ותאפשר לך ליהנות מהדירה בשקט. אל תחתום על חוזה שאינך מבין או שיש בו תנאים שאינך מסכים אליהם."
    }
  },
  5: {
    title: "חתימת חוזה השכירות",
    icon: <FaKey className="h-8 w-8" />,
    description: "תהליך החתימה, תשלומים ראשוניים וקבלת המפתחות",
    content: {
      intro: "לאחר שבדקת את כל הפרטים והסכמת עם המשכיר על כל התנאים, הגיע הזמן לחתום על חוזה השכירות ולבצע את התשלומים הראשוניים.",
      sections: [
        {
          title: "קריאה אחרונה וחתימת החוזה",
          content: [
            "קרא את כל החוזה שוב לפני החתימה - אפילו אם עברת עליו קודם.",
            "ודא שכל השינויים והתיקונים שביקשת בוצעו בחוזה הסופי.",
            "אם יש סעיפים לא ברורים, דרוש הסבר או ייעוץ משפטי לפני החתימה.",
            "חתום רק אחרי שאתה מבין ומסכים לכל סעיף בחוזה.",
            "ודא שגם המשכיר חותם באותו זמן ובאותו מקום."
          ]
        },
        {
          title: "ביצוע התשלומים הראשוניים",
          content: [
            "הכן את כל הכסף המבויקש: פיקדון + חודש ראשון + דמי תיווך (אם יש).",
            "דרוש קבלות על כל תשלום - פיקדון, שכירות, כל תשלום נוסף.",
            "אם אפשר, שלם בהעברה בנקאית עם פירוט במקום מזומן.",
            "ודא שכל התשלומים רשומים בחוזה או במסמך נפרד.",
            "שמור את כל הקבלות במקום בטוח - תצטרך אותן בסוף השכירות."
          ]
        },
        {
          title: "תיעוד מצב הדירה בכניסה",
          content: [
            "צלם או סרטן את כל הדירה בפירוט - קירות, ריצוף, ריהוט, מכשירים.",
            "רשום רשימה של כל הפגמים הקיימים ותאריך אותה.",
            "דרוש מהמשכיר לחתום על מסמך המתעד את מצב הדירה.",
            "שים לב במיוחד לדברים יקרים לתיקון - אמבטיה, מטבח, מכשירי חשמל.",
            "שלח לעצמך את התיעוד במייל כדי לוודא שיש לך גיבוי עם תאריך."
          ]
        },
        {
          title: "קבלת המפתחות והעברת שירותים",
          content: [
            "קבל את כל המפתחות - דירה, בניין, תיבת דואר, מחסן (אם יש).",
            "ודא שכל המפתחות עובדים ועשה עותקים נוספים לעצמך.",
            "העבר על שמך את חשבונות החשמל, מים, אינטרנט (לפי החוזה).",
            "עדכן את כתובתך בבנק, ביטוח, מקום עבודה ורשויות רלוונטיות.",
            "ברר מספרי טלפון חשובים - ועד בית, אחזקת בניין, מלווח ראשי."
          ]
        },
        {
          title: "הסדרים אחרונים",
          content: [
            "הסכם עם המשכיר על ערוץ תקשורת עדיף (טלפון, וואטסאפ, מייל).",
            "ברר מה התהליך לדיווח על תקלות ומה זמני התגובה הצפויים.",
            "ודא שיש לך את כל פרטי המשכיר ואיש קשר למקרה חירום.",
            "שמור את החוזה במקום בטוח ושלח עותק לעצמך במייל.",
            "הכן תיקיה מאורגנת לכל המסמכים הקשורים לדירה."
          ]
        }
      ],
      summary: "חתימת החוזה היא רק תחילת הדרך. תיעוד נכון ותשלומים מסודרים יבטיחו שתתחיל את השכירות בצורה נכונה ויקטינו בעיות עתידיות."
    }
  },
  6: {
    title: "מעבר לדירה ותקופת השכירות",
    icon: <FaHandshake className="h-8 w-8" />,
    description: "מעבר לדירה, שמירה על הזכויות ותחזוקה שוטפת",
    content: {
      intro: "עכשיו שחתמת על החוזה וקיבלת את המפתחות, חשוב לדעת איך לנהל את תקופת השכירות בצורה נכונה ולשמור על הזכויות שלך.",
      sections: [
        {
          title: "מעבר מקצועי לדירה",
          content: [
            "תכנן את המעבר מראש - שכר טרנספורט מתאים לכמות החפצים.",
            "עשה את המעבר בשעות המותרות בבניין כדי לא להפריע לשכנים.",
            "בדוק שוב את כל המערכות אחרי המעבר - חשמל, מים, חימום, אינטרנט.",
            "התרכש עם השכנים והציג את עצמך - זה יעזור למערכות יחסים טובות.",
            "דווח למשכיר שהמעבר הושלם ושהכל בסדר."
          ]
        },
        {
          title: "ניהול תקציב השכירות החודשי",
          content: [
            "שלם את דמי השכירות בזמן - עיכובים יכולים לגרום לבעיות ולחרמות.",
            "עקוב אחרי חשבונות החשמל, מים וועד בית ושלם אותם במועד.",
            "שמור קבלות על כל התשלומים ועשה תיק מסודר.",
            "אם יש בעיה פיננסית זמנית, דבר עם המשכיר מראש ולא אחרי העיכוב.",
            "תכנן מראש לתשלומים שנתיים כמו ארנונה או ביטוח."
          ]
        },
        {
          title: "תחזוקה ושמירה על הדירה",
          content: [
            "שמור על הדירה נקייה ובמצב טוב - זה גם לטובתך וגם לטובת הפיקדון.",
            "דווח מיידית על תקלות שעלולות להתפתח לבעיות גדולות.",
            "בצע תחזוקה שוטפת שהיא באחריותך - החלפת נורות, ניקיון מסנני מיזוג.",
            "אל תעשה שינויים בדירה ללא אישור בכתב מהמשכיר.",
            "שמור על יחסים טובים עם השכנים כדי למנוע תלונות מיותרות."
          ]
        },
        {
          title: "התמודדות עם בעיות ותקלות",
          content: [
            "דווח על תקלות מיידית למשכיר ושמור תיעוד של הדיווח.",
            "אם המשכיר לא מגיב, שלח הודעה בכתב (מייל או SMS) להתחברת.",
            "במקרה של תקלות חירום, תקן ושמור קבלות לתיחוב מהמשכיר.",
            "אם יש מחלוקת על תיקונים, עיין בחוזה או קבל ייעוץ משפטי.",
            "שמור תקשורת מקצועית ורגועה עם המשכיר גם בזמן בעיות."
          ]
        },
        {
          title: "סיום השכירות והחזרת הפיקדון",
          content: [
            "הודע למשכיר על כוונתך לעזוב בזמן הנדרש בחוזה (בדרך כלל 30 יום).",
            "נקה את הדירה היטב והחזר אותה למצב הדומה לכניסה.",
            "הזמן את המשכיר לביקור סופי ולבדיקת מצב הדירה יחד.",
            "השתמש בתיעוד שעשית בכניסה כדי להראות שלא גרמת נזקים.",
            "דרוש את הפיקדון תוך 14 יום מהעזיבה, כפי שמתחייב בחוק."
          ]
        }
      ],
      summary: "תקופת שכירות מוצלחת תלויה בניהול נכון, תקשורת טובה עם המשכיר ושמירה על הזכויות שלך. כשאתה מנהל הכל בצורה מקצועית, גם המשכיר וגם אתה מרוויחים."
    }
  }
};

export default async function RenterGuidePage({ params }) {
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
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
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
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
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
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stepNumber / 6) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-500">
                {Math.round((stepNumber / 6) * 100)}%
              </span>
              <Link
                href="/renter/faq"
                className="inline-flex items-center px-3 py-1.5 border border-purple-300 rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors text-sm"
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
              <div key={index} className="border-r-4 border-purple-500 pr-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start">
                      <FaCheckCircle className="h-5 w-5 text-purple-500 mt-0.5 ml-3 flex-shrink-0" />
                      <p className="text-gray-700 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
              <FaClock className="h-5 w-5 ml-2" />
              סיכום השלב
            </h3>
            <p className="text-purple-800 leading-relaxed">
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
                href={`/renter/${prevStep}`}
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
                href={`/renter/${step}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === stepNumber
                    ? 'bg-purple-600 text-white'
                    : step < stepNumber
                    ? 'bg-purple-500 text-white'
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
                href={`/renter/${nextStep}`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                שלב הבא
                <FaArrowCircleLeft className="h-5 w-5 mr-2" />
              </Link>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center px-6 py-3 border border-purple-200 rounded-md text-purple-800 bg-purple-50">
                  <FaCheckCircle className="h-5 w-5 ml-2 text-purple-600" />
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
                href={`/renter/${step}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === stepNumber
                    ? 'bg-purple-600 text-white'
                    : step < stepNumber
                    ? 'bg-purple-500 text-white'
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
                  href={`/renter/${prevStep}`}
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
                  href={`/renter/${nextStep}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  שלב הבא
                  <FaArrowCircleLeft className="h-4 w-4 mr-2" />
                </Link>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 border border-purple-200 rounded-md text-purple-800 bg-purple-50 text-sm">
                    <FaCheckCircle className="h-4 w-4 ml-2 text-purple-600" />
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