'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaBuilding, FaUser, FaChartBar, FaCog } from 'react-icons/fa';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'לוח בקרה',
      icon: <FaHome className="w-5 h-5" />,
      href: '/dashboard',
    },
    {
      title: 'נכסים',
      icon: <FaBuilding className="w-5 h-5" />,
      href: '/dashboard/properties',
    },
    {
      title: 'פרופיל',
      icon: <FaUser className="w-5 h-5" />,
      href: '/dashboard/profile',
    },
    // {
    //   title: 'אנליטיקה',
    //   icon: <FaChartBar className="w-5 h-5" />,
    //   href: '/dashboard/analytics',
    // },
    // {
    //   title: 'הגדרות',
    //   icon: <FaCog className="w-5 h-5" />,
    //   href: '/dashboard/settings',
    // },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-white text-2xl font-bold">נדל"ן</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
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
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 