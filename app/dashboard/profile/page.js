'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaCloudUploadAlt, FaTimes, FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaUserTie, FaCalendarAlt, FaAward, FaBed, FaBath, FaRuler } from 'react-icons/fa';
import Button from '../../components/ui/Button';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [processingLogo, setProcessingLogo] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    agencyName: '',
    bio: '',
    licenseNumber: '',
    activityArea: '',
    calendlyLink: '',
    socialMedia: {
      instagram: '',
      facebook: ''
    }
  });
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    propertyType: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      
      setFormData({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        whatsapp: data.phone || '',
        agencyName: data.agencyName || '',
        bio: data.bio,
        licenseNumber: data.licenseNumber,
        activityArea: data.activityArea,
        calendlyLink: data.calendlyLink || '',
        socialMedia: {
          instagram: data.socialMedia?.instagram || '',
          facebook: data.socialMedia?.facebook || ''
        }
      });

      if (data.profileImage?.secure_url) {
        setImagePreview(data.profileImage.secure_url);
      }

      if (data.logo?.secure_url) {
        setLogoPreview(data.logo.secure_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'שגיאה בטעינת הפרופיל' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let imageData = null;
      let logoData = null;

      if (profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', profileImage);
        imageFormData.append('upload_preset', 'real-estate');

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: imageFormData,
          }
        );

        if (!uploadRes.ok) throw new Error('Error uploading image');
        imageData = await uploadRes.json();
        
        console.log('=== CLOUDINARY PROFILE IMAGE UPLOAD RESPONSE ===');
        console.log('Full response:', imageData);
        console.log('public_id:', imageData.public_id);
        console.log('secure_url:', imageData.secure_url);
        console.log('format:', imageData.format);
        console.log('resource_type:', imageData.resource_type);
        console.log('width:', imageData.width);
        console.log('height:', imageData.height);
        console.log('bytes:', imageData.bytes);
        console.log('created_at:', imageData.created_at);
        console.log('version:', imageData.version);
        console.log('folder:', imageData.folder);
        console.log('All response keys:', Object.keys(imageData));
        console.log('===============================================');
      }

      if (logo) {
        const logoFormData = new FormData();
        logoFormData.append('logo', logo);

        console.log('🔄 Processing logo with background removal...');
        console.log('Logo file details:', {
          name: logo.name,
          size: logo.size,
          type: logo.type
        });
        
        setProcessingLogo(true);
        setMessage({ type: 'info', text: 'מעבד את הלוגו ומסיר רקע...' });
        
        try {
          const uploadRes = await fetch('/api/users/process-logo', {
            method: 'POST',
            body: logoFormData,
          });

          console.log('Response status:', uploadRes.status);
          console.log('Response headers:', Object.fromEntries(uploadRes.headers.entries()));

          if (!uploadRes.ok) {
            const errorData = await uploadRes.json();
            console.error('❌ Background removal failed:', errorData);
            throw new Error(errorData.error || 'Error processing logo');
          }
          
          logoData = await uploadRes.json();
          
          console.log('=== LOGO PROCESSING COMPLETE (Profile) ===');
          console.log('Processed logo data:', logoData);
          console.log('secure_url:', logoData.secure_url);
          console.log('publicId:', logoData.publicId);
          console.log('overlayPublicId:', logoData.overlayPublicId);
          console.log('=========================================');
        } catch (fetchError) {
          console.error('❌ Error in background removal request:', fetchError);
          // Fall back to direct upload if background removal fails
          console.log('🔄 Falling back to direct upload...');
          const logoFormData = new FormData();
          logoFormData.append('file', logo);
          logoFormData.append('upload_preset', 'real-estate');

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: logoFormData,
            }
          );

          if (!uploadRes.ok) throw new Error('Error uploading logo');
          const logoResponse = await uploadRes.json();
          
          const overlayPublicId = logoResponse.public_id ? 
            `l_${logoResponse.public_id.replace(/[\/\-\.]/g, '_')}` : null;
          
          logoData = {
            secure_url: logoResponse.secure_url,
            publicId: logoResponse.public_id,
            overlayPublicId: overlayPublicId
          };
          
          console.log('⚠️ Used fallback upload (no background removal)');
        } finally {
          setProcessingLogo(false);
        }
      }

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          profileImage: imageData ? {
            secure_url: imageData.secure_url,
            publicId: imageData.public_id
          } : undefined,
          logo: logoData ? {
            secure_url: logoData.secure_url,
            publicId: logoData.publicId,
            overlayPublicId: logoData.overlayPublicId
          } : undefined
        }),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      setMessage({ type: 'success', text: 'הפרופיל עודכן בהצלחה' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'שגיאה בעדכון הפרופיל' });
    } finally {
      setSaving(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredProperties = formData.properties?.filter(property => {
    if (activeTab !== 'all' && property.status !== activeTab) return false;
    if (filters.minPrice && property.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && property.price > Number(filters.maxPrice)) return false;
    if (filters.bedrooms && property.bedrooms !== Number(filters.bedrooms)) return false;
    if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
    return true;
  });

  const propertyCounts = {
    all: formData.properties?.length || 0,
    'For Sale': formData.properties?.filter(p => p.status === 'For Sale').length || 0,
    'For Rent': formData.properties?.filter(p => p.status === 'For Rent').length || 0,
  };

  if (loading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">עריכת פרופיל</h1>

        {message.text && (
          <div className={`p-4 rounded-md mb-6 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 
            message.type === 'info' ? 'bg-blue-50 text-blue-800' : 
            'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תמונת פרופיל
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative w-32 h-32 mx-auto">
                      <Image
                        src={imagePreview}
                        alt="Profile preview"
                        fill
                        className="rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>העלה תמונה</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pr-1">או גרור לכאן</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG עד 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                לוגו הסוכנות
                {processingLogo && (
                  <span className="text-blue-600 text-sm mr-2">
                    (מעבד ומסיר רקע...)
                  </span>
                )}
              </label>
              <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                processingLogo ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
              }`}>
                <div className="space-y-1 text-center">
                  {logoPreview ? (
                    <div className="relative w-32 h-32 mx-auto">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        disabled={processingLogo}
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                      {processingLogo && (
                        <div className="absolute inset-0 bg-blue-200 bg-opacity-75 rounded-md flex items-center justify-center">
                          <div className="text-blue-600 text-sm font-medium">
                            מעבד...
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>העלה לוגו</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleLogoChange}
                            disabled={processingLogo}
                          />
                        </label>
                        <p className="pr-1">או גרור לכאן</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG עד 10MB</p>
                      <p className="text-xs text-blue-600 font-medium">
                        הרקע יוסר אוטומטית בעת העלאה
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                שם מלא
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                דואר אלקטרוני
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="text-black mt-1 block w-full rounded-md border-b border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                טלפון
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="text-black mt-1 block w-full rounded-md border-b border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                שם הסוכנות
              </label>
              <input
                type="text"
                name="agencyName"
                value={formData.agencyName}
                onChange={handleChange}
                required
                className="text-black mt-1 block w-full rounded-md border-b border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700">
                וואטסאפ (אופציונלי)
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="text-black  mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                מספר רישיון תיווך
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                className="text-black  mt-1 block w-full rounded-md border-b border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                אזור פעילות
              </label>
              <input
                type="text"
                name="activityArea"
                value={formData.activityArea}
                onChange={handleChange}
                required
                className="text-black mt-1 block w-full rounded-md border-b border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                אודות
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
                rows={4}
                className="text-black mt-1 block w-full rounded-md border-b border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Calendly Link */}
            <div>
              <label htmlFor="calendlyLink" className="block text-lg font-medium text-blue-500">
                קישור Calendly
              </label>
              <div className="mt-1">
                <input
                  id="calendlyLink"
                  name="calendlyLink"
                  type="url"
                  value={formData.calendlyLink}
                  onChange={handleChange}
                  placeholder="https://calendly.com/your-link"
                  className="text-black  mt-1 block w-full px-3 py-2 border-b border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  הוסף את הקישור ל-Calendly שלך לתיאום פגישות
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-4">
              <h3 className="text-lg font-medium text-blue-500">רשתות חברתיות</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  אינסטגרם (שם משתמש)
                </label>
                <input
                  type="text"
                  name="socialMedia.instagram"
                  value={formData.socialMedia.instagram}
                  onChange={handleChange}
                  className="text-black mt-1 block w-full rounded-md border-b border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  פייסבוק (קישור מלא לפרופיל)
                </label>
                <input
                  type="text"
                  name="socialMedia.facebook"
                  value={formData.socialMedia.facebook}
                  onChange={handleChange}
                  className="text-black mt-1 block w-full rounded-md border-b border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://facebook.com/profile"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="ml-3"
              >
                {saving ? 'שומר...' : 'שמור שינויים'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Add the filters section after your tabs */}
      {/* <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">סינון נכסים</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מחיר מינימלי</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="מחיר מינימלי"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מחיר מקסימלי</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="מחיר מקסימלי"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">חדרי שינה</label>
            <select
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">הכל</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סוג נכס</label>
            <select
              name="propertyType"
              value={filters.propertyType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">הכל</option>
              <option value="House">בית פרטי</option>
              <option value="Apartment">דירה</option>
              <option value="Condo">דירת גן</option>
              <option value="Villa">וילה</option>
              <option value="Land">מגרש</option>
            </select>
          </div>
        </div>
      </div> */}

      {/* Update your properties grid section */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredProperties?.length > 0 ? (
          filteredProperties.map((property) => (
            <Link key={property._id} href={`/properties/${property._id}`}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                <div className="relative h-48 w-full">
                  <Image
                    src={property.images[0]?.secure_url || '/placeholder-property.jpg'}
                    alt={property.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
                    {property.status === 'For Sale' ? 'למכירה' : 'להשכרה'}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{property.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                  <p className="text-blue-600 text-xl font-bold mb-4">
                    ₪{property.price.toLocaleString()}
                  </p>
                  
                  <div className="flex justify-between text-gray-600">
                    <div className="flex items-center">
                      <FaBed className="mr-2" />
                      <span>{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <FaBath className="mr-2" />
                      <span>{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <FaRuler className="mr-2" />
                      <span>{property.area} m²</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-2 py-8 bg-gray-50 rounded-lg">
            אין נכסים להצגה בקטגוריה זו
          </p>
        )}
      </div> */}
    </div>
  );
} 