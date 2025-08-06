import { Heebo } from 'next/font/google';
import './globals.css';
import ConditionalNavbar from './components/layout/ConditionalNavbar';
import ConditionalFooter from './components/layout/ConditionalFooter';
import { Analytics } from '@vercel/analytics/next';

const heebo = Heebo({ subsets: ['hebrew', 'latin'] });

export const metadata = {
  title: {
    default: "KeysMatch - פלטפורמת נדל״ן מתקדמת",
    template: "%s | KeysMatch"
  },
  description: "מצא את בית חלומותיך באמצעות פלטפורמת הנדל״ן המתקדמת שלנו. חיפוש נכסים, ניהול נכסים, ותיווך מקצועי.",
  keywords: [
    "נדל״ן",
    "תיווך",
    "רכישת נכס",
    "מכירת נכס",
    "השכרת נכס",
    "פלטפורמת נדל״ן",
    "חיפוש נכסים",
    "ניהול נכסים",
    "תיווך נדל״ן",
    "בית למכירה",
    "דירה להשכרה"
  ],
  authors: [{ name: "KeysMatch Team" }],
  creator: "KeysMatch",
  publisher: "KeysMatch",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://keysmatch.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "KeysMatch - פלטפורמת נדל״ן מתקדמת",
    description: "מצא את בית חלומותיך באמצעות פלטפורמת הנדל״ן המתקדמת שלנו. חיפוש נכסים, ניהול נכסים, ותיווך מקצועי.",
    url: 'https://keysmatch.com',
    siteName: 'KeysMatch',
    locale: 'he_IL',
    type: 'website',
    images: [
      {
        url: '/logo-original.JPEG',
        width: 1200,
        height: 630,
        alt: 'KeysMatch - פלטפורמת נדל״ן מתקדמת',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "KeysMatch - פלטפורמת נדל״ן מתקדמת",
    description: "מצא את בית חלומותיך באמצעות פלטפורמת הנדל״ן המתקדמת שלנו.",
    images: ['/logo-original.JPEG'],
    creator: '@keysmatch',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
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
