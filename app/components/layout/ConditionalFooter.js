'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer className="bg-[#08171f] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">אודותינו</h3>
            <p className="text-gray-400">
              אנו עוזרים לך למצוא את הנכס המושלם שמתאים לצרכים ולהעדפות שלך.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">קישורים מהירים</h3>
            <ul className="space-y-2">
              <li>
                <a href="/properties" className="text-gray-400 hover:text-white">
                  נכסים
                </a>
              </li>
              <li>
                <a href="/agents" className="text-gray-400 hover:text-white">
                  סוכנים
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white">
                  צור קשר
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">פרטי התקשרות</h3>
            <ul className="space-y-2 text-gray-400">
              <li>דוא"ל: info@realestate.com</li>
              <li>טלפון: 04-123-4567</li>
              <li>כתובת: רחוב הרצל 1, חיפה</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 gap-2">עקבו אחרינו</h3>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white">
                פייסבוק
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                אינסטגרם
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>© {new Date().getFullYear()} נדל"ן. כל הזכויות שמורות.</p>
          <div>
          <Link 
  href="https://fikranova.com" 
  target="_blank" 
  rel="noopener noreferrer"
>
  פיתוח ועיצוב על ידי Fikranova
</Link>
          </div>
          
        </div>
      </div>
    </footer>
  );
} 