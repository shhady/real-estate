'use client';
import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'אירעה שגיאה בשליחת הטופס');
      }
      
      setStatus({ loading: false, success: true, error: null });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        error: error.message || 'אירעה שגיאה בשליחת הטופס. אנא נסה שוב.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">צור קשר</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            יש לך שאלות? אנחנו כאן בשבילך. צור איתנו קשר ונחזור אליך בהקדם.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">פרטי התקשרות</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaPhone className="h-6 w-6 text-[#08171f]" />
                </div>
                <div className="mr-4">
                  <h3 className="text-lg font-medium text-gray-900">טלפון</h3>
                  <p className="mt-1 text-gray-600">04-123-4567</p>
                  <p className="text-gray-600">050-123-4567</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaEnvelope className="h-6 w-6 text-[#08171f]" />
                </div>
                <div className="mr-4">
                  <h3 className="text-lg font-medium text-gray-900">דוא"ל</h3>
                  <p className="mt-1 text-gray-600">info@realestate.com</p>
                  <p className="text-gray-600">support@realestate.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaMapMarkerAlt className="h-6 w-6 text-[#08171f]" />
                </div>
                <div className="mr-4">
                  <h3 className="text-lg font-medium text-gray-900">כתובת</h3>
                  <p className="mt-1 text-gray-600">רחוב הרצל 1</p>
                  <p className="text-gray-600">חיפה, ישראל</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="mt-8 h-64 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3352.9844517084493!2d34.9886006!3d32.816391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151dba4c750de309%3A0x39bf89d5a49496c8!2sHerzl%20St%201%2C%20Haifa!5e0!3m2!1sen!2sil!4v1635789245611!5m2!1sen!2sil"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">שלח הודעה</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  שם מלא
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  דוא"ל
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  טלפון
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  נושא
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  הודעה
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              {status.error && (
                <div className="text-red-600 text-sm">{status.error}</div>
              )}

              {status.success && (
                <div className="text-green-600 text-sm">
                  ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.
                </div>
              )}

              <button
                type="submit"
                disabled={status.loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#08171f] hover:bg-[#F6F6F6] hover:text-[#08171f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {status.loading ? 'שולח...' : 'שלח הודעה'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 