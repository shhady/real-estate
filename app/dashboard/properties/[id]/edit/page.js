'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import Button from '../../../../components/ui/Button';
import { getUserLogoOverlayId } from '../../../../utils/userLogo';
import axios from 'axios';
import { cityOptions } from '../../../../utils/cityOptions';

export default function EditPropertyPage({ params }) {
  const router = useRouter();
  const propertyId = use(params).id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [applyOverlay, setApplyOverlay] = useState(false);
  const [userLogoOverlayId, setUserLogoOverlayId] = useState(null);
  const [loadingUserLogo, setLoadingUserLogo] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '0',
    location: '',
    country: 'ישראל',
    propertyCategory: 'residential',
    propertyType: '',
    status: '',
    bedrooms: '0',
    bathrooms: '0',
    area: '0',
    landArea: '',
    parkingLots: '',
    elevator: false,
    secureRoom: false,
    accessibleEntrance: false,
    airConditioning: false,
    terrace: false,
    gardenArea: '',
    features: [],
    contentType: 'single-image',
    floor: '',
    notes: '',
    agencyName: '',
    address: {
      neighborhood: '',
      street: '',
      number: ''
    },
    descriptions: {
      hebrew: '',
      arabic: ''
    }
  });
  // Country/City dropdown state
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');

  const filteredCities = cityOptions.filter(city =>
    city.label.toLowerCase().includes(citySearchTerm.toLowerCase())
  );
  const countryOptions = [
    { value: 'ישראל', label: 'ישראל' },
    { value: 'ארצות הברית', label: 'ארצות הברית' },
    { value: 'קנדה', label: 'קנדה' },
    { value: 'מקסיקו', label: 'מקסיקו' },
    { value: 'בריטניה', label: 'בריטניה' },
    { value: 'אירלנד', label: 'אירלנד' },
    { value: 'צרפת', label: 'צרפת' },
    { value: 'גרמניה', label: 'גרמניה' },
    { value: 'איטליה', label: 'איטליה' },
    { value: 'ספרד', label: 'ספרד' },
    { value: 'פורטוגל', label: 'פורטוגל' },
    { value: 'יוון', label: 'יוון' },
    { value: 'קפריסין', label: 'קפריסין' },
    { value: 'טורקיה', label: 'טורקיה' },
    { value: 'רומניה', label: 'רומניה' },
    { value: 'בולגריה', label: 'בולגריה' },
    { value: 'הונגריה', label: 'הונגריה' },
    { value: 'פולין', label: 'פולין' },
    { value: 'צ׳כיה', label: 'צ׳כיה' },
    { value: 'סלובקיה', label: 'סלובקיה' },
    { value: 'אוקראינה', label: 'אוקראינה' },
    { value: 'גיאורגיה', label: 'גיאורגיה' },
    { value: 'קרואטיה', label: 'קרואטיה' },
    { value: 'סרביה', label: 'סרביה' },
    { value: 'מונטנגרו', label: 'מונטנגרו' },
    { value: 'הולנד', label: 'הולנד' },
    { value: 'בלגיה', label: 'בלגיה' },
    { value: 'שווייץ', label: 'שווייץ' },
    { value: 'אוסטריה', label: 'אוסטריה' },
    { value: 'דנמרק', label: 'דנמרק' },
    { value: 'שוודיה', label: 'שוודיה' },
    { value: 'נורווגיה', label: 'נורווגיה' },
    { value: 'פינלנד', label: 'פינלנד' },
    { value: 'איחוד האמירויות', label: 'איחוד האמירויות' },
    { value: 'סעודיה', label: 'סעודיה' },
    { value: 'ירדן', label: 'ירדן' },
    { value: 'מצרים', label: 'מצרים' },
    { value: 'מרוקו', label: 'מרוקו' },
    { value: 'תוניסיה', label: 'תוניסיה' },
    { value: 'דרום אפריקה', label: 'דרום אפריקה' },
    { value: 'אוסטרליה', label: 'אוסטרליה' },
    { value: 'ניו זילנד', label: 'ניו זילנד' },
    { value: 'יפן', label: 'יפן' },
    { value: 'סין', label: 'סין' },
    { value: 'הודו', label: 'הודו' },
    { value: 'סינגפור', label: 'סינגפור' }
  ];
  const filteredCountries = countryOptions.filter(c =>
    c.label.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  // Fetch user's logo overlay ID when component mounts
  useEffect(() => {
    const fetchUserLogo = async () => {
      setLoadingUserLogo(true);
      console.log('🎨 Fetching user logo for overlay...');
      
      const overlayId = await getUserLogoOverlayId();
      setUserLogoOverlayId(overlayId);
      setLoadingUserLogo(false);
      
      console.log('🎨 User logo overlay ID:', overlayId);
      if (overlayId) {
        console.log('✅ Will use user logo instead of hardcoded logo');
      } else {
        console.log('⚠️ No user logo found, will use fallback or no overlay');
      }
    };
    
    fetchUserLogo();
  }, []);

  // Debug: Log form data changes
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  // Auto-calc landArea for garden apartment (דירת גן => 'condo')
  useEffect(() => {
    if (formData.propertyType === 'condo') {
      const base = Number(formData.area || 0);
      const garden = Number(formData.gardenArea || 0);
      const computed = base + garden;
      if (String(formData.landArea || '') !== String(computed)) {
        setFormData(prev => ({ ...prev, landArea: String(computed) }));
      }
    }
  }, [formData.propertyType, formData.area, formData.gardenArea]);

  // Function to determine content type based on number of images
  const determineContentType = (imageCount) => {
    if (imageCount === 0) return 'single-image';
    if (imageCount === 1) return 'single-image';
    return 'carousel';
  };

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
      const propertyImages = property.images || [];
      console.log('Loading property data:', property); // Debug log
      
      setFormData({
        title: property.title || '',
        description: property.description || '',
        price: property.price || '0',
        location: property.location || '',
        country: property.country || 'ישראל',
        propertyType: property.propertyType || '',
        status: property.status || '',
        bedrooms: property.bedrooms || '0',
        bathrooms: property.bathrooms || '',
        area: property.area || '0',
        landArea: property.landArea || '',
        parkingLots: property.parkingLots || '',
        gardenArea: property.gardenArea || '',
        elevator: property.elevator || false,
        secureRoom: property.secureRoom || false,
        accessibleEntrance: property.accessibleEntrance || false,
        airConditioning: property.airConditioning || false,
        terrace: property.terrace || false,
        features: property.features || [],
        contentType: property.contentType || determineContentType(propertyImages.length),
        floor: property.floor || '',
        notes: property.notes || '',
        agencyName: property.agencyName || '',
        address: property.address || { neighborhood: '', street: '', number: '' },
        descriptions: {
          hebrew: property.descriptions?.hebrew || '',
          arabic: property.descriptions?.arabic || ''
        }
      });
      setImages(propertyImages);
    } catch (error) {
      console.error('Error fetching property:', error);
      setMessage({ type: 'error', text: 'שגיאה בטעינת הנכס' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested descriptions object
    if (name.startsWith('descriptions.')) {
      const lang = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        descriptions: {
          ...prev.descriptions,
          [lang]: value
        }
      }));
    } else if (name.startsWith('address.')) {
      const [addressPart, subPart] = name.split('.');
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [subPart]: value
        }
      }));
    } else {
    setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Country/City handlers
  const handleCountryInputChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, country: value }));
    setCountrySearchTerm(value);
    setShowCountryDropdown(true);
  };
  const handleCountryInputFocus = () => {
    setShowCountryDropdown(true);
    setCountrySearchTerm(formData.country || '');
  };
  const handleCountryInputBlur = () => {
    setTimeout(() => setShowCountryDropdown(false), 200);
  };
  const handleCountrySelect = (countryValue) => {
    setFormData(prev => ({ ...prev, country: countryValue }));
    setShowCountryDropdown(false);
    setCountrySearchTerm('');
  };
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, location: value }));
    if (formData.country === 'ישראל') {
      setCitySearchTerm(value);
      setShowCityDropdown(true);
    } else {
      setShowCityDropdown(false);
    }
  };
  const handleLocationInputFocus = () => {
    if (formData.country === 'ישראל') {
      setShowCityDropdown(true);
      setCitySearchTerm(formData.location);
    }
  };
  const handleLocationInputBlur = () => {
    setTimeout(() => setShowCityDropdown(false), 200);
  };
  const handleCitySelect = (cityValue) => {
    setFormData(prev => ({ ...prev, location: cityValue }));
    setShowCityDropdown(false);
    setCitySearchTerm('');
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        await uploadFile(file);
      } catch (error) {
        console.error('Error uploading image:', error);
        setMessage({ type: 'error', text: 'שגיאה בהעלאת התמונה' });
      }
    }
  };

  const uploadFile = async (file) => {
    try {
      // Define transformation before signature request if overlay is enabled
      let transformation = null;
      
      if (applyOverlay) {
        if (userLogoOverlayId) {
          // Use the user's actual logo
          transformation = `${userLogoOverlayId},g_south_west,x_20,y_20,w_400`;
          console.log('🎨 Using user logo overlay:', transformation);
        } else {
          // Fallback to hardcoded logo if user has no logo
          transformation = 'l_no-bg-golden-removebg-preview_l3tbtr,g_south_west,x_20,y_20,w_400';
          console.log('⚠️ Using fallback hardcoded logo:', transformation);
        }
      }
      
      // Step 1: Get the signature from our backend, including transformation if needed
      const signatureResponse = await axios.post('/api/cloudinary/signature', {
        folder: 'media_uploads',
        fileType: 'image',
        transformation: transformation // Include transformation in signature request
      });
      
      console.log('Signature response:', signatureResponse.data);
      
      const { signature, timestamp, cloudName, apiKey, folder, resource_type } = signatureResponse.data;
      
      // Step 2: Prepare form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);
      
      // Add transformation only if it was included in the signature
      if (transformation) {
        formData.append('transformation', transformation);
        if (userLogoOverlayId) {
          console.log('✅ Applied USER LOGO overlay:', userLogoOverlayId);
        } else {
          console.log('⚠️ Applied fallback hardcoded logo overlay');
        }
      }

      // Log the form data for debugging
      console.log('Form data keys being sent:', Array.from(formData.keys()));

      // Step 3: Upload directly to Cloudinary using XHR
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: percentComplete
          }));
        }
      };

      // Create a promise to handle the XHR response
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.error) {
                console.error('Cloudinary error:', response.error);
                reject(new Error(response.error.message || 'Upload failed'));
              } else {
                resolve(response);
              }
            } catch (error) {
              console.error('Error parsing response:', error);
              reject(new Error('Could not parse upload response'));
            }
          } else {
            console.error('Upload failed with status:', xhr.status);
            console.error('Response text:', xhr.responseText);
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = (e) => {
          console.error('XHR error:', e);
          reject(new Error('Network error during upload'));
        };
      });

      // Send the request to Cloudinary
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resource_type}/upload`);
      xhr.send(formData);

      // Wait for the upload to complete
      const data = await uploadPromise;

      // Clear progress for this file
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[file.name];
        return updated;
      });

      console.log('Successfully uploaded file:', data);

      // Add the uploaded image to state
      setImages(prev => {
        const newImages = [...prev, {
          secure_url: data.secure_url,
          publicId: data.public_id
        }];
        
        // Update content type based on new image count
        setFormData(prevFormData => ({
          ...prevFormData,
          contentType: determineContentType(newImages.length)
        }));
        
        return newImages;
      });

    } catch (error) {
      // Clear progress for this file
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[file.name];
        return updated;
      });
      
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      
      // Update content type based on new image count
      setFormData(prevFormData => ({
        ...prevFormData,
        contentType: determineContentType(newImages.length)
      }));
      
      return newImages;
    });
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
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
        area: Number(formData.area),
        landArea: formData.landArea !== '' ? Number(formData.landArea) : undefined,
        parkingLots: formData.parkingLots !== '' ? Number(formData.parkingLots) : undefined,
        gardenArea: formData.gardenArea !== '' ? Number(formData.gardenArea) : undefined,
        elevator: !!formData.elevator,
        secureRoom: !!formData.secureRoom,
        accessibleEntrance: !!formData.accessibleEntrance,
        airConditioning: !!formData.airConditioning,
        terrace: !!formData.terrace,
        images,
        contentType: determineContentType(images.length), // Ensure contentType matches image count
        descriptions: formData.descriptions,
        floor: formData.floor,
        notes: formData.notes,
        agencyName: formData.agencyName,
        address: formData.address
      };

      console.log('Updating property with data:', propertyData); // Debug log

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
            {/* Logo overlay info */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-md font-medium text-blue-800 mb-2">על הוספת הלוגו</h3>
              <p className="text-sm text-blue-700 mb-2">
                כאשר תסמן את אפשרות הוספת הלוגו, הלוגו יתווסף לפינה הימנית התחתונה של התמונות שתעלה בגודל מוגדל לנראות טובה יותר
              </p>
              <p className="text-xs text-blue-600">
                <strong>הערה:</strong> הלוגו חייב להיות כלול בתמונת הפרופיל שלך. אם אתה מתמודד עם שגיאות, 
                אנא בדוק שהלוגו קיים בפרופיל.
              </p>
            </div>

            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
              תמונות הנכס
            </label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                images.length <= 1
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {images.length <= 1 ? 'תמונה יחידה' : 'גלריה'}
                {images.length > 0 && ` (${images.length} תמונות)`}
              </span>
            </div>
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
                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-700">
                    💡 <strong>טיפ:</strong> תמונה אחת = תמונה יחידה, מספר תמונות = גלריה. 
                    סוג התוכן מתעדכן אוטומטית בהתאם למספר התמונות.
                  </p>
                </div>

                {/* Logo Overlay Toggle */}
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="applyOverlay"
                        checked={applyOverlay}
                        onChange={(e) => setApplyOverlay(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="applyOverlay" className="mr-2 text-sm font-medium text-gray-700">
                        הוספת לוגו לתמונות
                      </label>
                    </div>
                    
                    <div className="text-xs">
                      {loadingUserLogo ? (
                        <span className="text-gray-500">טוען לוגו...</span>
                      ) : userLogoOverlayId ? (
                        <span className="text-green-600">✓ הלוגו זמין</span>
                      ) : (
                        <span className="text-orange-600">⚠ אין לוגו</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-1">
                    {userLogoOverlayId 
                      ? 'הלוגו שלך יתווסף לפינה הימנית התחתונה של התמונות'
                      : 'העלה לוגו בפרופיל כדי להשתמש בתכונה זו'
                    }
                  </p>
                </div>

                {/* Upload Progress */}
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(uploadProgress).map(([fileName, progress]) => (
                      <div key={fileName} className="bg-gray-100 rounded p-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{fileName}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                קטגוריה נכס
              </label>
              <select
                name="propertyCategory"
                value={formData.propertyCategory}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
              >
                <option value="residential">מגורים</option>
                <option value="commercial">מסחרי</option>
                <option value="land">קרקע</option>
              </select>
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
                <option value="office">משרד</option>
                <option value="warehouse">מחסן</option>
                <option value="other">אחר</option>
                <option value="cottage">קוטג'/קיר משותף</option>
                <option value="duplex">דופלקס</option>
                <option value="agriculturalLand">קרקע חקלאית</option>
                <option value="residentialLand">קרקע בניה (מגורים)</option>
                <option value="industrialLand">קרקע תעשייה</option>
                <option value="commercialLand">קרקע מסחרית</option>
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

            {/* Country */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">מדינה</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleCountryInputChange}
                onFocus={handleCountryInputFocus}
                onBlur={handleCountryInputBlur}
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                placeholder="בחר או הקלד מדינה"
              />
              {showCountryDropdown && filteredCountries.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
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

            {/* Location / City */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">מיקום</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleLocationInputChange}
                onFocus={handleLocationInputFocus}
                onBlur={handleLocationInputBlur}
                required
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                placeholder={formData.country === 'ישראל' ? 'עיר, שכונה או כתובת מלאה' : 'עיר/כתובת (כתיבה חופשית)'}
              />
              {formData.country === 'ישראל' && showCityDropdown && filteredCities.length > 0 && (
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

            {/* Land area for house/villa/cottage */}
            {(formData.propertyType === 'house' || formData.propertyType === 'villa' || formData.propertyType === 'cottage') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">שטח מגרש (מ"ר)</label>
                <input
                  type="number"
                  name="landArea"
                  value={formData.landArea}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                />
              </div>
            )}

            {/* Garden area for garden apartment */}
            {formData.propertyType === 'condo' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">שטח גינה (מ"ר)</label>
                <input
                  type="number"
                  name="gardenArea"
                  value={formData.gardenArea}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                />
              </div>
            )}

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
                קומה
              </label>
              <input
                type="text"
                name="floor"
                value={formData.floor || ''}
                onChange={handleChange}
                placeholder="למשל: 3, קרקע, מרתף"
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
              />
            </div>
            {/* Parking lots */}
            <div>
              <label className="block text-sm font-medium text-gray-700">חניות</label>
              <input
                type="number"
                name="parkingLots"
                value={formData.parkingLots}
                onChange={handleChange}
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
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
              />
            </div>

            {/* Features (checkboxes) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">תכונות</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-gray-700">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="elevator"
                    checked={!!formData.elevator}
                    onChange={(e)=> setFormData(prev=>({ ...prev, elevator: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  מעלית
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="secureRoom"
                    checked={!!formData.secureRoom}
                    onChange={(e)=> setFormData(prev=>({ ...prev, secureRoom: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  חדר ממ"ד
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="accessibleEntrance"
                    checked={!!formData.accessibleEntrance}
                    onChange={(e)=> setFormData(prev=>({ ...prev, accessibleEntrance: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  כניסה נגישה
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="airConditioning"
                    checked={!!formData.airConditioning}
                    onChange={(e)=> setFormData(prev=>({ ...prev, airConditioning: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  מיזוג אוויר
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="terrace"
                    checked={!!formData.terrace}
                    onChange={(e)=> setFormData(prev=>({ ...prev, terrace: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  מרפסת/טרסה
                </label>
              </div>
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
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
              />
            </div>
          </div>

          {/* Address Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                שכונה
              </label>
              <input
                type="text"
                name="address.neighborhood"
                value={formData.address.neighborhood}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                רחוב
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
              />
            </div>
                         <div>
               <label className="block text-sm font-medium text-gray-700">
                 מספר בית
               </label>
               <input
                 type="text"
                 name="address.number"
                 value={formData.address.number}
                 onChange={handleChange}
                 className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
               />
             </div>
           </div>
           <p className="text-xs text-gray-500 mt-2">
             הזן שכונה, רחוב ומספר בית לתצוגה מדויקת יותר במפה
           </p>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              הערות נוספות
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="הערות נוספות על הנכס..."
              className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              תיאור
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="תיאור כללי של הנכס..."
              className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
            />
          </div> */}

          {/* Descriptions in Hebrew and Arabic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                תיאור בעברית
              </label>
              <textarea
                name="descriptions.hebrew"
                value={formData.descriptions.hebrew}
                onChange={handleChange}
                rows={6}
                placeholder="תיאור מפורט של הנכס בעברית..."
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                dir="rtl"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.descriptions.hebrew.length}/2000 תווים
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                תיאור בערבית
              </label>
              <textarea
                name="descriptions.arabic"
                value={formData.descriptions.arabic}
                onChange={handleChange}
                rows={6}
                placeholder="وصف مفصل للعقار باللغة العربية..."
                className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
                dir="rtl"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.descriptions.arabic.length}/2000 תווים
              </p>
            </div>
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