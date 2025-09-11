export const metadata = {
  title: "הצהרת נגישות | KeysMatch",
  description: "הצהרת נגישות של אתר KeysMatch – התחייבותנו להנגשת השירותים הדיגיטליים לכלל המשתמשים.",
};

export default function AccessibilityStatementPage() {
  return (
    <section className="container mx-auto px-4 py-10" dir="rtl" lang="he">
      <h1 className="text-3xl font-bold mb-6">הצהרת נגישות</h1>

      <p className="mb-4">
        באתר <strong>KeysMatch</strong> אנו רואים חשיבות עליונה בהנגשת האתר והשירותים הדיגיטליים שאנו מספקים לכלל הציבור,
        לרבות אנשים עם מוגבלויות. אנו פועלים בהתאם להנחיות התקן הישראלי 5568 המבוסס על תקן העולמי
        WCAG 2.1 ברמה AA, ושואפים לספק חוויית שימוש נוחה, ברורה ושוויונית לכל המשתמשים.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">אמצעי הנגשה עיקריים באתר</h2>
      <ul className="list-disc pr-6 space-y-2">
        <li>תמיכה בניווט מלא באמצעות מקלדת.</li>
        <li>יחסי ניגודיות צבעים מספקים וטיפוגרפיה קריאה.</li>
        <li>כותרות מבניות, אזורי ניווט ברורים ותוויות לטפסים.</li>
        <li>טקסט חלופי לתמונות ותכנים ויזואליים משמעותיים.</li>
        <li>תמיכה בקוראי מסך והוספת מאפייני ARIA היכן שנדרש.</li>
        <li>התאמה למכשירים ניידים ותצוגות שונות (רספונסיביות).</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">תוסף נגישות</h2>
      <p className="mb-4">
        באתר מוטמע תוסף הנגישות של חברת <strong>Enable</strong> המאפשר התאמות נגישות נוספות בלחיצת כפתור,
        כגון הגדלת טקסט, שינוי ניגודיות, הדגשת קישורים, התאמות ניווט ועוד. ניתן להפעיל את התוסף באמצעות האייקון המופיע בתחתית האתר.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">רמת הנגישות והחרגות</h2>
      <p className="mb-4">
        אנו פועלים באופן שוטף לשיפור הנגישות באתר. ייתכן וחלק מהעמודים או התכנים טרם הונגשו במלואם, או מצויים בתהליך הנגשה.
        אם נתקלתם בקושי או בעיה כלשהי – נשמח לקבל משוב כדי לשפר.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">דרכי יצירת קשר בנושאי נגישות</h2>
      <p className="mb-2">ניתן לפנות אלינו בכל שאלה, בקשה או דיווח על בעיית נגישות באמצעות:</p>
      <ul className="list-disc pr-6 space-y-2">
        <li>דוא"ל: <a className="underline" href="mailto:support@keysmatch.com">support@keysmatch.com</a></li>
        <li>טלפון: <a className="underline" href="tel:+972-50-000-0000">+972-50-000-0000</a></li>
      </ul>

      <p className="text-sm text-gray-500 mt-6">
        תאריך עדכון אחרון: 11.09.2025
      </p>

      <hr className="my-8" />

      <h2 className="text-xl font-semibold mt-8 mb-3">הצהרת נגישות מותאמת אישית</h2>
      <p className="mb-4">
        הצהרת נגישות מותאמת אישית מאת בעל האתר. הצהרה זו מופיעה בסוף הצהרת הנגישות המקורית ומטרתה להוסיף מידע ייעודי
        על מאמצי הנגישות באתר, התאמות ייחודיות שבוצעו, והתחייבותנו להמשך שיפור מתמיד.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Accessibility Statement (English)</h2>
      <p className="mb-4">
        We are committed to making our website accessible to all users, including people with disabilities. Our goal is to conform to WCAG 2.1 Level AA. If you experience any difficulty, please contact us at
        <a className="underline ml-1" href="mailto:support@keysmatch.com">support@keysmatch.com</a>.
      </p>
    </section>
  );
}


