'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FaArrowRight, FaEnvelope } from 'react-icons/fa';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'שגיאה בשליחת האימייל');
      }

      setEmailSent(true);
      setMessage('נשלח אימייל עם קישור לאיפוס סיסמה. אנא בדוק את תיבת הדואר שלך.');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FaEnvelope className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                האימייל נשלח!
              </h2>
              <p className="text-gray-600 mb-6">
                שלחנו קישור לאיפוס סיסמה לכתובת: <br />
                <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                אם לא תמצא את האימייל, בדוק גם בתיקיית הספאם.
                הקישור תקף למשך 24 שעות.
              </p>
              <div className="space-y-3">
                <Link
                  href="/sign-in"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  חזרה להתחברות
                </Link>
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                    setMessage('');
                    setError('');
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  שלח שוב
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          איפוס סיסמה
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                דואר אלקטרוני
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="הזן כתובת אימייל"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'שולח...' : 'שלח קישור לאיפוס'}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/sign-in"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <FaArrowRight className="h-3 w-3 ml-1" />
                חזרה להתחברות
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}