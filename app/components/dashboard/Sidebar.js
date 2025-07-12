'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaHome, FaBuilding, FaUser, FaChartBar, FaCog, FaEdit, FaPhone, FaUsers, FaSignOutAlt, FaEnvelope, FaGlobe, FaExchangeAlt, FaTimes } from 'react-icons/fa';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const router = useRouter();

  const dashboardItems = [
    {
      title: 'לוח בקרה',
      icon: <FaHome className="w-5 h-5" />,
      href: '/dashboard',
    },
    {
      title: 'ניתוח שיחות',
      icon: <FaPhone className="w-5 h-5" />,
      href: '/dashboard/call-analysis',
    },
    {
      title: 'לקוחות שלי',
      icon: <FaUsers className="w-5 h-5" />,
      href: '/dashboard/clients',
    },
    {
      title: 'התאמות',
      icon: <FaExchangeAlt className="w-5 h-5" />,
      href: '/dashboard/matching',
    },
    {
      title: 'נכסים שלי',
      icon: <FaBuilding className="w-5 h-5" />,
      href: '/dashboard/properties',
    },
    // {
    //   title: 'בלוג שלי',
    //   icon: <FaEdit className="w-5 h-5" />,
    //   href: '/dashboard/blog',
    // },
    {
      title: 'פרופיל',
      icon: <FaUser className="w-5 h-5" />,
      href: '/dashboard/profile',
    },
  ];

  const navigationItems = [
    {
      title: 'דף הבית',
      icon: <FaGlobe className="w-5 h-5" />,
      href: '/',
    },
    {
      title: 'נכסים',
      icon: <FaBuilding className="w-5 h-5" />,
      href: '/properties',
    },
    {
      title: 'סוכנים',
      icon: <FaUsers className="w-5 h-5" />,
      href: '/agents',
    },
    // {
    //   title: 'בלוג',
    //   icon: <FaEdit className="w-5 h-5" />,
    //   href: '/blog',
    // },
    {
      title: 'צור קשר',
      icon: <FaEnvelope className="w-5 h-5" />,
      href: '/contact',
    },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        // Navigate to home page
        router.push('/');
        // Force a complete page refresh
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLinkClick = () => {
    // Close mobile sidebar when a link is clicked
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-between px-4">
          <h1 className="text-white text-2xl font-bold">נדל"ן</h1>
          {/* Close button for mobile */}
          <button
            className="md:hidden text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {/* Dashboard Items */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              ניהול
            </div>
            {dashboardItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className={`ml-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                    {item.icon}
                  </div>
                  {item.title}
                </Link>
              );
            })}
          </div>

          {/* Navigation Items */}
          <div className="space-y-1 pt-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              האתר
            </div>
            {navigationItems.map((item) => {
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={handleLinkClick}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <div className="ml-3 text-gray-400 group-hover:text-gray-300">
                    {item.icon}
                  </div>
                  {item.title}
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <div className="pt-6">
            <button
              onClick={() => {
                handleLogout();
                handleLinkClick();
              }}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-red-600 hover:text-white"
            >
              <div className="ml-3 text-gray-400 group-hover:text-white">
                <FaSignOutAlt className="w-5 h-5" />
              </div>
              התנתק
            </button>
          </div>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full transform transition ease-in-out duration-300">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar; 