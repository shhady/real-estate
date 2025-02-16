import { Inter } from 'next/font/google';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';

const inter = Inter({ subsets: ['latin'] });

export default function DashboardLayout({ children }) {
  return (
    <div className={`${inter.className} min-h-screen bg-gray-100`}>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden bg-gray-100">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 