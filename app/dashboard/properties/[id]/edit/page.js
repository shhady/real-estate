'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import Button from '@/app/components/ui/Button';

export default function EditPropertyPage({ params }) {
  const router = useRouter();
  const propertyId = use(params).id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '0',
    location: '',
    propertyType: '',
    status: '',
    bedrooms: '0',
    bathrooms: '0',
    area: '0',
    features: []
  });

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/properties/${propertyId}`, {
        cache: 'no-store'
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch property');
      }
      
      const property = await res.json();
      setFormData({
        title: property.title,
        description: property.description,
        price: property.price,
        location: property.location,
        propertyType: property.propertyType,
        status: property.status,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        features: property.features || []
      });
      setImages(property.images || []);
    } catch (error) {
      console.error('Error fetching property:', error);
      setMessage({ type: 'error', text: 'שגיאה בטעינת הנכס' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'real-estate');

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!res.ok) throw new Error('Error uploading image');
        const data = await res.json();

        setImages(prev => [...prev, {
          secure_url: data.secure_url,
          publicId: data.public_id
        }]);
      } catch (error) {
        console.error('Error uploading image:', error);
        setMessage({ type: 'error', text: 'שגיאה בהעלאת התמונה' });
      }
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const propertyData = {
        ...formData,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        images
      };

      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update property');
      }

      setMessage({ type: 'success', text: 'הנכס עודכן בהצלחה' });
      router.push('/dashboard/properties');
    } catch (error) {
      console.error('Error updating property:', error);
      setMessage({ type: 'error', text: error.message || 'שגיאה בעדכון הנכס' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">עריכת נכס</h1>

      {message.text && (
        <div className={`p-4 rounded-md mb-6 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תמונות הנכס
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-400 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <div className="flex flex-wrap gap-4 mb-4">
                  {images && images.length > 0 ? (
                    images.map((image, index) => (
                      <div key={index} className="relative w-24 h-24">
                        <img
                          src={image.secure_url}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            e.target.src = '/placeholder-property.jpg';
                            console.error(`Failed to load image: ${image.secure_url}`);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">אין תמונות להצגה</p>
                  )}
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

          {/* Basic Information */}
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
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
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
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
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
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
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
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
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
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
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
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
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
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
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
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              תיאור
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
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
              disabled={saving}
              className="mr-3"
            >
              {saving ? 'שומר...' : 'עדכן נכס'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 