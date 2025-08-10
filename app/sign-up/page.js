'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    fullNameEnglish: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agencyName: '',
    agencyLogo: '',
    bio: '',
    licenseNumber: '',
    activityArea: '',
    calendlyLink: '',
    profileImage: null,
    logo: null,
    socialMedia: {
      instagram: '',
      facebook: ''
    }
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingLogo, setProcessingLogo] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  console.log(formData);
  const removeImage = () => {
    setFormData(prev => ({ ...prev, profileImage: null }));
    setImagePreview(null);
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
    setLogoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      setLoading(false);
      return;
    }

    try {
      let profileImageData = null;
      let logoData = null;

      // Upload image to Cloudinary if selected
      if (formData.profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', formData.profileImage);
        imageFormData.append('upload_preset', 'real-estate');

        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: imageFormData,
          }
        );

        if (!cloudinaryRes.ok) {
          throw new Error('Failed to upload image');
        }

        const imageData = await cloudinaryRes.json();
        profileImageData = {
          secure_url: imageData.secure_url,
          publicId: imageData.public_id
        };
      }

      // Process logo with background removal if selected
      if (formData.logo) {
        console.log('🎯 STARTING LOGO PROCESSING - Sign-up');
        console.log('🎯 Logo exists:', !!formData.logo);
        console.log('🎯 Logo details:', {
          name: formData.logo.name,
          size: formData.logo.size,
          type: formData.logo.type
        });

        const logoFormData = new FormData();
        logoFormData.append('logo', formData.logo);
        
        console.log('🎯 FormData created for logo');
        console.log('🎯 FormData keys:', Array.from(logoFormData.keys()));

        console.log('🔄 Processing logo with background removal...');
        console.log('Logo file details:', {
          name: formData.logo.name,
          size: formData.logo.size,
          type: formData.logo.type
        });
        
        setProcessingLogo(true);
        
        try {
          console.log('📡 Making API call to /api/users/process-logo...');
          console.log('📡 Request URL:', '/api/users/process-logo');
          console.log('📡 Current location:', window.location.href);
          
          const uploadRes = await fetch('/api/users/process-logo', {
            method: 'POST',
            headers: {
              'x-signup-request': 'true'
            },
            body: logoFormData,
          });

          console.log('Response status:', uploadRes.status);
          console.log('Response headers:', Object.fromEntries(uploadRes.headers.entries()));

          if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            console.error('❌ Background removal failed:', errorText);
            throw new Error(`Background removal failed: ${uploadRes.status}`);
          }
          
          const responseText = await uploadRes.text();
          
          try {
            logoData = JSON.parse(responseText);
          } catch (parseError) {
            console.error('❌ JSON parsing error:', parseError);
            console.error('❌ Response text:', responseText);
            throw new Error('Invalid response from background removal service');
          }
          
          console.log('=== LOGO PROCESSING COMPLETE (Signup) ===');
          console.log('Processed logo data:', logoData);
          console.log('secure_url:', logoData.secure_url);
          console.log('publicId:', logoData.publicId);
          console.log('overlayPublicId:', logoData.overlayPublicId);
          console.log('=========================================');
        } catch (fetchError) {
          console.error('❌ Error in background removal request:', fetchError);
          console.error('❌ Error type:', typeof fetchError);
          console.error('❌ Error constructor:', fetchError.constructor.name);
          console.error('❌ Error message:', fetchError.message);
          console.error('❌ Full error object:', fetchError);
          
          // Fall back to direct upload if background removal fails
          console.log('🔄 Falling back to direct upload due to error...');
          const fallbackLogoFormData = new FormData();
          fallbackLogoFormData.append('file', formData.logo);
          fallbackLogoFormData.append('upload_preset', 'real-estate');

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: fallbackLogoFormData,
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

      // Register user with Cloudinary image data
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          profileImage: profileImageData,
          agencyLogo: logoData
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error during registration');
      }

      // Redirect to sign-in page after successful registration
      router.push('/sign-in?registered=true');
      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          הרשמה לחשבון חדש
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          או{' '}
          <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
            התחברות לחשבון קיים
          </Link>
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

            {/* Profile Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
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
                        <label htmlFor="profile-image" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>העלה תמונה</span>
                          <input
                            id="profile-image"
                            name="profile-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pr-1">או גרור לכאן</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG עד 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                שם מלא בעברית
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className=" text-black appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="fullNameEnglish" className="block text-sm font-medium text-gray-700">
                שם מלא באנגלית (ישמש כתובת URL)
              </label>
              <div className="mt-1">
                <input
                  id="fullNameEnglish"
                  name="fullNameEnglish"
                  type="text"
                  required
                  value={formData.fullNameEnglish}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="text-black appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">יופיע בכתובת האתר שלך: domain.com/agents/johndoe</p>
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                טלפון
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700">
                שם הסוכנות
              </label>
              <div className="mt-1">
                <input
                  id="agencyName"
                  name="agencyName"
                  type="text"
                  required
                  value={formData.agencyName}
                  onChange={handleChange}
                  // placeholder="לדוגמה: GoldenKey"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="agencyLogo" className="block text-sm font-medium text-gray-700">
                הלוגו של הסוכנות
              </label>
              <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${processingLogo ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}>
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
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="agency-logo" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>העלה הלוגו</span>
                          <input
                            id="agency-logo"
                            name="agency-logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            disabled={processingLogo}
                            className="sr-only"
                          />
                        </label>
                        <p className="pr-1">או גרור לכאן</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG עד 10MB
                      </p>
                      {processingLogo && (
                        <p className="text-xs text-blue-600 font-medium">
                          מעבד את הלוגו ומסיר רקע...
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
                וואטסאפ (אופציונלי)
              </label>
              <div className="mt-1">
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div> */}

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                קצת עליי
              </label>
              <div className="mt-1">
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  required
                  value={formData.bio}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                מספר רישיון תיווך
              </label>
              <div className="mt-1">
                <input
                  id="licenseNumber"
                  name="licenseNumber"
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="activityArea" className="block text-sm font-medium text-gray-700">
                אזור פעילות
              </label>
              <div className="mt-1">
                <input
                  id="activityArea"
                  name="activityArea"
                  type="text"
                  required
                  value={formData.activityArea}
                  onChange={handleChange}
                  placeholder="לדוגמה: מרכז הארץ, תל אביב והסביבה"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="calendlyLink" className="block text-sm font-medium text-gray-700">
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
                  className="text-black appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm  placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  הוסף את הקישור ל-Calendly שלך לתיאום פגישות
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                סיסמה
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                אימות סיסמה
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || processingLogo}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {processingLogo ? 'מעבד לוגו...' : loading ? 'מבצע הרשמה...' : 'הרשמה'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 