'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCloudUploadAlt, FaTimes, FaMagic } from 'react-icons/fa';
import Button from '@/app/components/ui/Button';

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewDescription, setPreviewDescription] = useState('');
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    propertyType: '',
    status: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    features: []
  });

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
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const propertyData = {
        ...formData,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        images: images.map(img => ({
          secure_url: img.secure_url || img.url,
          publicId: img.publicId || img.public_id
        }))
      };

      console.log('Submitting property data:', propertyData);

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create property');
      }

      setMessage({ type: 'success', text: 'הנכס נוצר בהצלחה' });
      router.push('/dashboard/properties');
      router.refresh();
    } catch (error) {
      console.error('Error creating property:', error);
      setMessage({ type: 'error', text: 'שגיאה ביצירת הנכס' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefactorDescription = async () => {
    if (!formData.description.trim()) {
      setMessage({ type: 'error', text: 'יש להזין תיאור לפני שימוש בשכתוב אוטומטי' });
      return;
    }

    setIsRefactoring(true);
    setPreviewDescription('');
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          // 'HTTP-Referer': window.location.origin,
          // 'X-Title': 'Real Estate Platform',
          // 'OR-Organization': 'org-shhady'
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-distill-llama-70b:free",
          messages: [
            {
              role: 'system',
              content: 'You are a professional real estate copywriter. You will receive property descriptions and details and convert them into formatted HTML listings. Respond ONLY with the formatted HTML, without any additional text or explanations just the html ! .'
            },
            {
              role: 'user',
              content: `Convert this property description and details into a formatted HTML listing with emojis and hashtags in same language of content only. Use this exact HTML structure and incorporate the provided details:

Property Details:
- Title: ${formData.title}
- Type: ${formData.propertyType}
- Status: ${formData.status}
- Price: ${formData.price}
- Location: ${formData.location}
- Bedrooms: ${formData.bedrooms}
- Bathrooms: ${formData.bathrooms}
- Area: ${formData.area}
- Features: ${formData.features.join(', ')}


Description to convert: ${formData.description}`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refactor description');
      }

      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        const cleanContent = data.choices[0].message.content.replace(/```html\n?|\n?```/g, '');
        setPreviewDescription(cleanContent);
        setMessage({ type: 'success', text: 'נוצר תיאור חדש! אנא בדוק את התצוגה המקדימה למטה' });
      } else {
        throw new Error('Invalid response format from AI service');
      }
    } catch (error) {
      console.error('Error refactoring description:', error);
      setMessage({ 
        type: 'error', 
        text: 'אירעה שגיאה בשכתוב התיאור. אנא נסה שוב מאוחר יותר.' 
      });
    } finally {
      setIsRefactoring(false);
    }
  };

  const applyRefactoredDescription = () => {
    setFormData(prev => ({
      ...prev,
      description: previewDescription
    }));
    setPreviewDescription('');
    setMessage({ type: 'success', text: 'התיאור החדש הוחל בהצלחה!' });
  };

  const cancelRefactoredDescription = () => {
    setPreviewDescription('');
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="p-6">
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
          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תמונות הנכס
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-400 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <div className="flex flex-wrap gap-4 mb-4">
                  {images.map((image, index) => (
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                תיאור
              </label>
              <Button
                type="button"
                variant="secondary"
                onClick={handleRefactorDescription}
                disabled={isRefactoring}
                className="flex items-center text-sm"
              >
                <FaMagic className="ml-2" />
                {isRefactoring ? 'משכתב...' : 'שכתב עם AI'}
              </Button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
            />

            {/* Preview Section */}
            {previewDescription && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900">תצוגה מקדימה של התיאור החדש</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={cancelRefactoredDescription}
                    >
                      בטל
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={applyRefactoredDescription}
                    >
                      החל תיאור חדש
                    </Button>
                  </div>
                </div>
                <div 
                  className="p-4 bg-gray-50 rounded-md border border-gray-200"
                  dangerouslySetInnerHTML={{ __html: previewDescription }}
                />
              </div>
            )}
          </div>

          {/* <div>
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
              className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
            />
          </div> */}

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
    </div>
  );
} 