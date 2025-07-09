import { Heebo } from 'next/font/google';
import './globals.css';
import ConditionalNavbar from './components/layout/ConditionalNavbar';
import ConditionalFooter from './components/layout/ConditionalFooter';
import { Analytics } from '@vercel/analytics/next';

const heebo = Heebo({ subsets: ['hebrew', 'latin'] });

export const metadata = {
  title: 'פלטפורמת נדל"ן',
  description: 'מצא את בית חלומותיך באמצעות פלטפורמת הנדל"ן שלנו',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={heebo.className}>
        <ConditionalNavbar />
        <main>{children} 
           <Analytics /></main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
