'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cityOptions } from '../../../utils/cityOptions';
import { countryOptions } from '../../../utils/countryOptions';

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    phoneNumber: '',
    email: '',
    intent: 'unknown',
    preferredLocation: '',
    preferredCountry: 'ישראל',
    propertyCategory: 'residential',
    preferredPropertyType: [],
    minRooms: '',
    minArea: '',
    maxPrice: '',
    preferredCondition: '',
    needsParking: null,
    needsBalcony: null,
    preApproval: 'אינו צריך אישור עקרוני',
    notes: '',
    status: 'active',
    priority: 'medium',
    preferredContact: 'phone',
    transcription: '',
    source: 'other',
    tags: []
  });

  const filteredCities = cityOptions.filter(city =>
    city.label.toLowerCase().includes(citySearchTerm.toLowerCase())
  );
  const filteredCountries = countryOptions.filter(c =>
    c.label.toLowerCase().includes(countrySearchTerm.toLowerCase())
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

  // Country handlers
  const handleCountrySelect = (countryValue) => {
    setFormData(prev => ({ ...prev, preferredCountry: countryValue }));
    setShowCountryDropdown(false);
    setCountrySearchTerm('');
  };
  const handleCountryInputChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, preferredCountry: value }));
    setCountrySearchTerm(value);
    setShowCountryDropdown(true);
  };
  const handleCountryInputFocus = () => {
    setShowCountryDropdown(true);
    setCountrySearchTerm(formData.preferredCountry);
  };
  const handleCountryInputBlur = () => {
    setTimeout(() => setShowCountryDropdown(false), 200);
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

  // Property category + multi-select options
  const RESIDENTIAL_OPTIONS = [
    { value: 'house', label: 'בית פרטי' },
    { value: 'apartment', label: 'דירה' },
    { value: 'condo', label: 'דירת גן' },
    { value: 'villa', label: 'וילה' },
    { value: 'cottage', label: "קוטג'/קיר משותף" },
    { value: 'duplex', label: 'דופלקס' },
  ];
  const COMMERCIAL_OPTIONS = [
    { value: 'office', label: 'משרד' },
    { value: 'commercial', label: 'מסחרי' },
    { value: 'warehouse', label: 'מחסן' },
    { value: 'land', label: 'קרקע' },
  ];

  const togglePreferredType = (val) => {
    setFormData(prev => {
      const exists = prev.preferredPropertyType.includes(val);
      return {
        ...prev,
        preferredPropertyType: exists
          ? prev.preferredPropertyType.filter(v => v !== val)
          : [...prev.preferredPropertyType, val]
      };
    });
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
                  כתובת אימייל (אופציונלי)
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
                  <option value="renter">שוכר</option>
                  <option value="landlord">משכיר</option>
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
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">אישור עקרוני</label>
              <select
                name="preApproval"
                value={formData.preApproval}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="יש אישור עקרוני">יש אישור עקרוני</option>
                <option value="אין אישור עקרוני">אין אישור עקרוני</option>
                <option value="אינו צריך אישור עקרוני">אינו צריך אישור עקרוני</option>
              </select>
            </div>
          </div>

          {/* Property Preferences */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">העדפות נכס</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מדינה מועדפת
                </label>
                <input
                  type="text"
                  name="preferredCountry"
                  value={formData.preferredCountry}
                  onChange={handleCountryInputChange}
                  onFocus={handleCountryInputFocus}
                  onBlur={handleCountryInputBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="בחר או הקלד מדינה..."
                />
                {showCountryDropdown && filteredCountries.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-10 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCountries.map((c) => (
                      <div
                        key={c.value}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-black"
                        onClick={() => handleCountrySelect(c.value)}
                      >
                        {c.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                  <div className="absolute left-0 right-0 top-full mt-1 z-10 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
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

              {/* Property category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריית נכס</label>
                <select
                  name="propertyCategory"
                  value={formData.propertyCategory}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="residential">מגורים</option>
                  <option value="commercial">מסחרי</option>
                </select>
              </div>

              {/* Preferred property types (multi-select via checkboxes) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סוגי נכס מועדפים</label>
                <div className="grid grid-cols-2 gap-2">
                  {(formData.propertyCategory === 'commercial' ? COMMERCIAL_OPTIONS : RESIDENTIAL_OPTIONS).map(opt => (
                    <label key={opt.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferredPropertyType.includes(opt.value)}
                        onChange={() => togglePreferredType(opt.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="mr-2 text-sm text-gray-900">{opt.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">באפשרותך לבחור יותר מסוג נכס אחד</p>
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
                
              </div>

              <div className="grid grid-cols-2 gap-4">
                
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

              {/* <div>
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
              </div> */}

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