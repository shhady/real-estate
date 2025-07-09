'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../components/ui/Button';
  
export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    agentName: '',
    phoneNumber: '',
    propertyType: '',
    location: '',
    area: '',
    price: '',
    rooms: '',
    floor: '',
    notes: ''
  });

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          const userData = await response.json();
          if (userData.authenticated && userData.user) {
            setUser(userData.user);
            setFormData(prev => ({
              ...prev,
              agentName: userData.user.name || '',
              phoneNumber: userData.user.phone || ''
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    // TODO: Navigate to next step (step 3)
    console.log('Form data:', formData);
  };

  const handleBack = () => {
    // TODO: Navigate to previous step (step 1)
    router.back();
  };

  const handleRestart = () => {
    // TODO: Restart the entire process
    setFormData({
      title: '',
      agentName: user?.name || '',
      phoneNumber: user?.phone || '',
      propertyType: '',
      location: '',
      area: '',
      price: '',
      rooms: '',
      floor: '',
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">הוספת נכס חדש</h1>

        {message.text && (
          <div className={`p-4 rounded-md mb-6 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תמונות הנכס
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-400 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex flex-wrap gap-4 mb-4">
                    {images?.map((image, index) => (
                      <div key={index} className="relative w-24 h-24">
                        <img
                          src={image.secure_url}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>העלה תמונות</span>
                      <input
                        type="file"
                        multiple
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="pr-1">או גרור לכאן</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG עד 10MB</p>
                </div>
              </div>
            </div>

          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  כותרת
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  מחיר
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  סוג נכס
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                >
                  <option value="">בחר סוג נכס</option>
                  <option value="house">בית פרטי</option>
                  <option value="apartment">דירה</option>
                  <option value="condo">דירת גן</option>
                  <option value="villa">וילה</option>
                  <option value="land">מגרש</option>
                  <option value="commercial">מסחרי</option>
                  <option value="cottage">קוטג'/קיר משותף</option>
                  <option value="duplex">דופלקס</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  סטטוס
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                >
                  <option value="">בחר סטטוס</option>
                  <option value="For Sale">למכירה</option>
                  <option value="For Rent">להשכרה</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  מיקום
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  שטח (מ"ר)
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  חדרי שינה
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  חדרי אמבטיה
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                תיאור
              </label>
              <div className="mt-1">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-xl p-2 border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                  placeholder="הזן תיאור קצר או כתוב 'צור לי תיאור'"
                  />
              </div>
              <div className="mt-2 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRefactorDescription}
                  disabled={!formData.description || isRefactoring}
                  className="bg-gray-500 text-black hover:bg-blue-600"
                >
                  {isRefactoring ? 'מעבד...' : 'שפר תיאור עם AI'}
                </Button>
              </div>
              {refactoredDescription && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">תיאור משופר:</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{refactoredDescription}</p>
                  <div className="mt-3 flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={cancelRefactoredDescription}
                    >
                      ביטול
                    </Button>
                    <Button
                      type="button"
                      onClick={applyRefactoredDescription}
                    >
                השתמש בתיאור החדש
              </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                תכונות נוספות
              </label>
              <input
                type="text"
                name="features"
                value={formData.features.join(', ')}
                onChange={(e) => {
                  const features = e.target.value.split(',').map(f => f.trim()).filter(Boolean);
                  setFormData(prev => ({ ...prev, features }));
                }}
                placeholder="הכנס תכונות מופרדות בפסיקים"
                className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                className="ml-3"
                onClick={() => router.back()}
              >
                ביטול
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="mr-3"
              >
                {loading ? 'שומר...' : 'צור נכס'}
              </Button>
            </div>
          </form>
        </div>
      </div> */}
    </div>
  );
} 