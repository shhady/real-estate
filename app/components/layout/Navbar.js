'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const navRef = useRef(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          },
          cache: 'no-store',
          credentials: 'include'
        });

        if (!res.ok) {
          setIsAuthenticated(false);
          return;
        }

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          setIsAuthenticated(false);
          return;
        }

        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [router.pathname]);

  // Click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target) && isOpen) {
        setIsOpen(false);
      }
    };

    // Only add listener when mobile menu is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        // Clear authentication state
        setIsAuthenticated(false);
        // Close mobile menu
        setIsOpen(false);
        // Navigate to home page
        router.push('/');
        // Force a complete page refresh
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav ref={navRef} className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">נדל"ן</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center justify-center md:gap-4 mr-4">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                דף הבית
              </Link>
              <Link
                href="/properties"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                נכסים
              </Link>
              <Link
                href="/agents"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                סוכנים
              </Link>
              {/* <Link
                href="/blog"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                בלוג
              </Link> */}
              <Link
                href="/contact"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                צור קשר
              </Link>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden sm:mr-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  לוח בקרה
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-600 hover:text-gray-900"
                >
                  התנתק
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-600 hover:text-gray-900"
                >
                  התחברות
                </Link>
                <Link
                  href="/sign-up"
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  הרשמה
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">פתח תפריט</span>
              {isOpen ? (
                <FaTimes className="block h-6 w-6" />
              ) : (
                <FaBars className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            onClick={closeMenu}
            className="block pr-3 pl-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            דף הבית
          </Link>
          <Link
            href="/properties"
            onClick={closeMenu}
            className="block pr-3 pl-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            נכסים
          </Link>
          <Link
            href="/agents"
            onClick={closeMenu}
            className="block pr-3 pl-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            סוכנים
          </Link>
          {/* <Link
            href="/blog"
            onClick={closeMenu}
            className="block pr-3 pl-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            בלוג
          </Link> */}
          <Link
            href="/contact"
            onClick={closeMenu}
            className="block pr-3 pl-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            צור קשר
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="block pr-3 pl-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                לוח בקרה
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-right pr-3 pl-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                התנתק
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                onClick={closeMenu}
                className="block pr-3 pl-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                התחברות
              </Link>
              <Link
                href="/sign-up"
                onClick={closeMenu}
                className="block pr-3 pl-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                הרשמה
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 