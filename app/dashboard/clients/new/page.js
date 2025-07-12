'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cityOptions } from '../../../utils/cityOptions';

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    phoneNumber: '',
    email: '',
    intent: 'unknown',
    preferredLocation: '',
    preferredPropertyType: '',
    minRooms: '',
    maxRooms: '',
    minArea: '',
    maxArea: '',
    minPrice: '',
    maxPrice: '',
    preferredCondition: '',
    needsParking: null,
    needsBalcony: null,
    preApproval: null,
    notes: '',
    status: 'prospect',
    priority: 'medium',
    preferredContact: 'phone',
    transcription: '',
    source: 'other',
    tags: []
  });

  const filteredCities = cityOptions.filter(city =>
    city.label.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  const handleCitySelect = (cityValue) => {
    setFormData(prev => ({ ...prev, preferredLocation: cityValue }));
    setShowCityDropdown(false);
    setCitySearchTerm('');
  };

  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, preferredLocation: value }));
    setCitySearchTerm(value);
    setShowCityDropdown(true);
  };

  const handleLocationInputBlur = () => {
    // Delay hiding dropdown to allow for selection
    setTimeout(() => {
      setShowCityDropdown(false);
    }, 200);
  };

  const handleLocationInputFocus = () => {
    setShowCityDropdown(true);
    setCitySearchTerm(formData.preferredLocation);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: e.target.checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseInt(value) : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create client');
      }

      router.push('/dashboard/clients');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">הוסף לקוח חדש</h1>
            <Link
              href="/dashboard/clients"
              className="text-gray-600 hover:text-gray-800"
            >
               חזור לרשימת הלקוחות
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">פרטים בסיסיים</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם הלקוח *
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="הכנס שם מלא"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מספר טלפון *
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="054-1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  כתובת אימייל
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אמצעי קשר מועדף
                </label>
                <select
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="phone">טלפון</option>
                  <option value="whatsapp">וואטסאפ</option>
                  <option value="email">אימייל</option>
                </select>
              </div>
            </div>
          </div>

          {/* Client Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">סטטוס ודחיפות</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  כוונת הלקוח
                </label>
                <select
                  name="intent"
                  value={formData.intent}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="unknown">לא ידוע</option>
                  <option value="buyer">קונה</option>
                  <option value="seller">מוכר</option>
                  <option value="both">קונה ומוכר</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  סטטוס
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="prospect">פרוספקט</option>
                  <option value="active">פעיל</option>
                  <option value="inactive">לא פעיל</option>
                  <option value="closed">סגור</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  דחיפות
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="low">נמוכה</option>
                  <option value="medium">בינונית</option>
                  <option value="high">גבוהה</option>
                </select>
              </div>
            </div>
            <label className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      name="preApproval"
                      checked={formData.preApproval === true}
                      onChange={(e) => setFormData(prev => ({ ...prev, preApproval: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="mr-2 text-sm text-gray-900">אישור עקרוני</span>
                  </label>
          </div>

          {/* Property Preferences */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">העדפות נכס</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  איזור מועדף
                </label>
                <input
                  type="text"
                  name="preferredLocation"
                  value={formData.preferredLocation}
                  onChange={handleLocationInputChange}
                  onFocus={handleLocationInputFocus}
                  onBlur={handleLocationInputBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="בחר עיר או כתוב איזור מועדף..."
                />
                {showCityDropdown && filteredCities.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCities.map((city) => (
                      <div
                        key={city.value}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-black"
                        onClick={() => handleCitySelect(city.value)}
                      >
                        {city.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  סוג נכס מועדף
                </label>
                <select
                  name="preferredPropertyType"
                  value={formData.preferredPropertyType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">בחר סוג נכס</option>
                  <option value="apartment">דירה</option>
                  <option value="house">בית</option>
                  <option value="commercial">מסחרי</option>
                  <option value="land">קרקע</option>
                  <option value="other">אחר</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מינימום חדרים
                  </label>
                  <input
                    type="number"
                    name="minRooms"
                    value={formData.minRooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מקסימום חדרים
                  </label>
                  <input
                    type="number"
                    name="maxRooms"
                    value={formData.maxRooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מינימום שטח (מ"ר)
                  </label>
                  <input
                    type="number"
                    name="minArea"
                    value={formData.minArea}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מקסימום שטח (מ"ר)
                  </label>
                  <input
                    type="number"
                    name="maxArea"
                    value={formData.maxArea}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מינימום מחיר (₪)
                  </label>
                  <input
                    type="number"
                    name="minPrice"
                    value={formData.minPrice}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מקסימום מחיר (₪)
                  </label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={formData.maxPrice}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מצב הנכס המועדף
                </label>
                <select
                  name="preferredCondition"
                  value={formData.preferredCondition}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">כל המצבים</option>
                  <option value="new">חדש</option>
                  <option value="good">מצב טוב</option>
                  <option value="needs renovation">צריך שיפוץ</option>
                  <option value="poor">מצב ירוד</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  דרישות נוספות
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="needsParking"
                      checked={formData.needsParking === true}
                      onChange={(e) => setFormData(prev => ({ ...prev, needsParking: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="mr-2 text-sm text-gray-900">חניה</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="needsBalcony"
                      checked={formData.needsBalcony === true}
                      onChange={(e) => setFormData(prev => ({ ...prev, needsBalcony: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="mr-2 text-sm text-gray-900">מרפסת</span>
                  </label>
                  
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Transcription */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">הערות ותיעוד</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  הערות כלליות
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="הערות חשובות על הלקוח, העדפות, דרישות מיוחדות..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תמליל שיחה (אופציונלי)
                </label>
                <textarea
                  name="transcription"
                  value={formData.transcription}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="תמליל שיחה או פגישה עם הלקוח..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  ניתן להוסיף תמליל של שיחה או פגישה עם הלקוח לתיעוד מפורט
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מקור הליד
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="other">אחר</option>
                  <option value="call">שיחה טלפונית</option>
                  <option value="website">אתר אינטרנט</option>
                  <option value="referral">הפניה</option>
                  <option value="advertising">פרסום</option>
                  <option value="social_media">רשתות חברתיות</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard/clients"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ביטול
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'שומר...' : 'שמור לקוח'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 