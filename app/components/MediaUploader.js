import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Modal from './Modal';
import { downloadMedia } from '../utils/downloadMedia';
import UploaderWizard from './UploaderWizard';
import { getUserLogoOverlayId } from '../utils/userLogo';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

export default function MediaUploader({ onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [applyOverlay, setApplyOverlay] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [showContentTypeOptions, setShowContentTypeOptions] = useState(true); // Start with content type selection
  const [selectedContentType, setSelectedContentType] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [webhookStatus, setWebhookStatus] = useState(null);
  const [showPropertyWizard, setShowPropertyWizard] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadItem, setDownloadItem] = useState(null);
  const [userLogoOverlayId, setUserLogoOverlayId] = useState(null);
  const [loadingUserLogo, setLoadingUserLogo] = useState(true);

  const onDrop = useCallback((acceptedFiles) => {
    // Clear previous errors
    setErrors({});
    
    // For video-from-images, only accept image files
    if (selectedContentType === 'video-from-images') {
      const invalidFiles = acceptedFiles.filter(file => !file.type.startsWith('image/'));
      
      if (invalidFiles.length > 0) {
        invalidFiles.forEach(file => {
          setErrors(prev => ({
            ...prev,
            [file.name]: 'Only images are allowed for Video from Photos'
          }));
        });
        
        // Filter out non-image files
        acceptedFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
      }
    }
    
    // Check file sizes and prepare preview data
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setErrors(prev => ({
          ...prev,
          [file.name]: `File exceeds 100MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`
        }));
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      // Add preview URLs to files
      const filesWithPreview = validFiles.map(file => 
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          mediaType: file.type.startsWith('image/') ? 'image' : 'video'
        })
      );
      
      setFiles(previousFiles => [...previousFiles, ...filesWithPreview]);
    }
  }, [selectedContentType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: selectedContentType === 'video-from-images' 
      ? { 'image/*': [] } 
      : { 'image/*': [], 'video/*': [] }
  });

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

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [files]);

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
        fileType: file.mediaType,
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

      // Start the upload - use the resource_type from the signature
      const resourceTypeToUse = resource_type || 'auto';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceTypeToUse}/upload`;
      console.log('Uploading to URL:', uploadUrl);
      
      xhr.open('POST', uploadUrl);
      xhr.send(formData);
      
      console.log('Upload started to Cloudinary:', {
        cloudName,
        resourceType: resourceTypeToUse,
        hasOverlay: applyOverlay
      });
      
      // Wait for upload to complete
      const response = await uploadPromise;
      console.log('Upload complete:', response);
      
      // Return the secure URL of the uploaded media
      return {
        url: response.secure_url,
        mediaType: file.mediaType
      };
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      setErrors(prev => ({
        ...prev,
        [file.name]: 'Upload failed: ' + (error.message || 'Unknown error')
      }));
      return null;
    }
  };

  const uploadAllFiles = async () => {
    if (files.length === 0 || uploading) return;
    
    setUploading(true);
    setUploadProgress({});
    
    const uploadResults = [];
    
    for (const file of files) {
      if (errors[file.name]) continue; // Skip files with errors
      
      const result = await uploadFile(file);
      if (result) {
        uploadResults.push(result);
      }
    }
    
    setUploading(false);
    
    if (uploadResults.length > 0) {
      setUploadedUrls(uploadResults);
      setShowPropertyWizard(true); // Show the property wizard instead of preview modal
    }
  };

  const sendCarouselNotification = async (mediaUrls, mediaTypes) => {
    console.log('Sending carousel notification for multiple uploads');
    
    // Set the correct contentType based on selection - strict comparison required
    let webhookContentType;
    if (selectedContentType === 'video-from-images') {
      webhookContentType = 'photosVideo';
    } else if (selectedContentType === 'Carousel') {
      webhookContentType = 'Carousel';
    } else {
      // Fallback to the actual selected content type if neither match
      webhookContentType = selectedContentType;
    }
    
    console.log('Using webhook content type:', webhookContentType, 'from selected type:', selectedContentType);
    
    const payload = {
      mediaUrls,
      mediaTypes,
      overlay: applyOverlay,
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID || 'default-client',
      contentType: webhookContentType,
      isCarousel: true
    };

    try {
      const response = await axios.post('/api/notify-carousel', payload);
      console.log('Carousel notification sent:', response.data);
      
      // Prepare success data
      const successData = {
        mediaUrls,
        mediaTypes,
        contentType: webhookContentType, 
        overlay: applyOverlay,
        isCarousel: true,
        isVideoFromImages: selectedContentType === 'video-from-images',
        webhookStatus: response.data.warning ? 'warning' : 'success'
      };
      
      // Set local state and show modal
      setUploadSuccess(successData);
      setWebhookStatus(successData.webhookStatus);
      setShowUploadModal(true);
      
      // Call parent callback
      onUploadComplete(successData);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending carousel notification:', error);
      
      // Prepare error data
      const errorData = {
        mediaUrls,
        mediaTypes,
        contentType: webhookContentType,
        overlay: applyOverlay,
        isCarousel: true,
        isVideoFromImages: selectedContentType === 'video-from-images',
        webhookStatus: 'error',
        error: error.message
      };
      
      // Set local state and show modal
      setUploadSuccess(errorData);
      setWebhookStatus('error');
      setShowUploadModal(true);
      
      // Call parent callback
      onUploadComplete(errorData);
      
      return { 
        success: false, 
        error: error.response?.data || error.message 
      };
    }
  };

  const notifyUpload = async (mediaUrl, mediaType) => {
    console.log('Sending upload notification');
    
    const payload = {
      mediaUrl,
      mediaType,
      overlay: applyOverlay,
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID || 'default-client',
      contentType: selectedContentType
    };

    try {
      const response = await axios.post('/api/notify-upload', payload);
      console.log('Upload notification sent:', response.data);
      
      // Prepare success data
      const successData = {
        mediaUrl,
        mediaType,
        contentType: selectedContentType,
        overlay: applyOverlay,
        isCarousel: false,
        webhookStatus: response.data.warning ? 'warning' : 'success'
      };
      
      // Set local state and show modal
      setUploadSuccess(successData);
      setWebhookStatus(successData.webhookStatus);
      setShowUploadModal(true);
      
      // Call parent callback
      onUploadComplete(successData);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending upload notification:', error);
      
      // Prepare error data
      const errorData = {
        mediaUrl,
        mediaType,
        contentType: selectedContentType,
        overlay: applyOverlay,
        isCarousel: false,
        webhookStatus: 'error',
        error: error.message
      };
      
      // Set local state and show modal
      setUploadSuccess(errorData);
      setWebhookStatus('error');
      setShowUploadModal(true);
      
      // Call parent callback
      onUploadComplete(errorData);
      
      return { 
        success: false, 
        error: error.response?.data || error.message 
      };
    }
  };

  const sendNotification = () => {
    setShowPreviewModal(false); // Close the preview modal
    
    // Make sure we're correctly identifying video-from-images mode vs Carousel mode
    if (uploadedUrls.length > 1) {
      const mediaUrls = uploadedUrls.map(item => item.url).filter(Boolean);
      const mediaTypes = uploadedUrls.map(item => item.mediaType).filter(Boolean);
      
      if (mediaUrls.length > 0) {
        // Let sendCarouselNotification handle the content type determination based on selectedContentType
        sendCarouselNotification(mediaUrls, mediaTypes);
      }
    } 
    else if (uploadedUrls.length > 0) {
      notifyUpload(uploadedUrls[0].url, uploadedUrls[0].mediaType);
    }
  };

  const selectContentType = (type) => {
    setSelectedContentType(type);
    setShowContentTypeOptions(false);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview);
    }
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleStartAgain = () => {
    // Clean up and reset state
    files.forEach(file => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    
    setFiles([]);
    setUploading(false);
    setUploadProgress({});
    setErrors({});
    setUploadedUrls([]);
    setShowContentTypeOptions(true);
    setSelectedContentType(null);
    setUploadSuccess(null);
    setShowUploadModal(false);
    setShowPreviewModal(false);
    setWebhookStatus(null);
    setShowPropertyWizard(false); // Reset property wizard state
  };

  const handleDownload = (url) => {
    // Create a modal-ready item object
    const mediaType = url.includes('/video/') || 
                     url.includes('/video_upload/') || 
                     /\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i.test(url) 
                     ? 'video' : 'image';
    
    setShowDownloadModal(true);
    setDownloadItem({
      url,
      mediaType
    });
  };
  
  // Execute download
  const executeDownload = (url) => {
    downloadMedia(url);
    setShowDownloadModal(false);
  };

  // Content type selection UI
  if (showContentTypeOptions) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          What type of content would you like to create?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => selectContentType('Single Post')}
            className="px-6 py-8 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <div className="text-center">
              <svg className="mx-auto h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
              </svg>
              <span className="mt-2 block text-base font-medium text-gray-900">תמונה אחת</span>
              <span className="mt-1 block text-sm text-gray-500">העלאת תמונה אחת</span>
            </div>
          </button>
          <button
            onClick={() => selectContentType('Carousel')}
            className="px-6 py-8 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <div className="text-center">
              <svg className="mx-auto h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span className="mt-2 block text-base font-medium text-gray-900">קרוסלה</span>
              <span className="mt-1 block text-sm text-gray-500">העלאת מספר תמונות</span>
            </div>
          </button>
          <button
            onClick={() => selectContentType('Video')}
            className="px-6 py-8 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <div className="text-center">
              <svg className="mx-auto h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="mt-2 block text-base font-medium text-gray-900">סרטון</span>
              <span className="mt-1 block text-sm text-gray-500">העלאת סרטון</span>
            </div>
          </button>
          <button
            onClick={() => selectContentType('video-from-images')}
            className="px-6 py-8 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <div className="text-center">
              <svg className="mx-auto h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14" />
              </svg>
              <span className="mt-2 block text-base font-medium text-gray-900">סרטון מתמונות</span>
              <span className="mt-1 block text-sm text-gray-500">יצירת סרטון ממספר תמונות</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          העלאת {selectedContentType === 'video-from-images' ? 'סרטון מתמונות' : 
            selectedContentType === 'Video' ? 'סרטון' :
            selectedContentType === 'Carousel' ? 'קרוסלה' :
            selectedContentType === 'Single Post' ? 'תמונה' : selectedContentType}
        </h3>
        <button
          onClick={handleStartAgain}
          className="text-sm text-blue-600 hover:underline"
        >
          שינוי סוג תוכן
        </button>
      </div>

      {selectedContentType === 'video-from-images' && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>יצירת סרטון מתמונות</strong>: העלאת מספר תמונות שייבנו בסדר שלך.
            הסדר של התמונות יעקב בסדר שבו תעלו אותן.
          </p>
        </div>
      )}

      {/* File drop zone */}
      <div 
        {...getRootProps()} 
        className={`p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48" 
            aria-hidden="true"
          >
            <path 
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-8m-12 0H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
              strokeWidth={2} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          
          <p className="mt-2 text-sm text-gray-700">
            Drag and drop images or videos, or click to select files
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Maximum file size: 100MB
          </p>
        </div>
      </div>

      {/* Overlay checkbox */}
      <div className="mt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={applyOverlay} 
            onChange={(e) => setApplyOverlay(e.target.checked)} 
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={loadingUserLogo}
          />
          <span className="text-sm text-gray-700">
            הוספת הלוגו 
            {loadingUserLogo && <span className="text-gray-500"> (טוען...)</span>}
            {!loadingUserLogo && userLogoOverlayId && <span className="text-green-600"> ✓</span>}
            {!loadingUserLogo && !userLogoOverlayId && <span className="text-orange-500"> (ללא לוגו)</span>}
          </span>
        </label>
        {!loadingUserLogo && userLogoOverlayId && (
          <p className="text-xs text-green-600 mt-1 mr-6">
            ישתמש בלוגו שלך מהפרופיל
          </p>
        )}
        {!loadingUserLogo && !userLogoOverlayId && (
          <p className="text-xs text-orange-500 mt-1 mr-6">
            העלה לוגו בפרופיל כדי להשתמש באפשרות זו
          </p>
        )}
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedContentType === 'video-from-images' ? 'סדרת תמונות' : 'תצוגת קובצים'}
          </h3>
          
          {selectedContentType === 'video-from-images' && (
            <p className="text-sm text-gray-600 mt-1 mb-3">
              Photos will appear in the slideshow in the order shown below. You can remove photos to adjust the sequence.
            </p>
          )}
          
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <li key={index} className="relative">
                <div className="group block w-full rounded-lg border overflow-hidden">
                  {selectedContentType === 'video-from-images' && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold z-10">
                      {index + 1}
                    </div>
                  )}
                  
                  {file.mediaType === 'image' ? (
                    <img 
                      src={file.preview} 
                      alt={file.name} 
                      className="h-32 w-full object-cover"
                    />
                  ) : (
                    <video 
                      src={file.preview} 
                      controls 
                      className="h-32 w-full object-cover"
                    />
                  )}
                  
                  <div className="p-2">
                    <p className="text-xs truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    
                    {errors[file.name] && (
                      <p className="text-xs text-red-500">{errors[file.name]}</p>
                    )}
                    
                    {uploading && uploadProgress[file.name] !== undefined && (
                      <div className="mt-1">
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-blue-600 h-2" 
                            style={{ width: `${uploadProgress[file.name]}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadProgress[file.name]}% uploaded
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 rounded-full bg-red-500 text-white p-1 opacity-70 hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Button Container */}
      <div className="mt-6 flex flex-col space-y-3">
        {/* Upload button */}
        <button
          type="button"
          onClick={uploadAllFiles}
          disabled={files.length === 0 || uploading}
          className={`py-2 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
            files.length === 0 || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : 'Upload All Files'}
        </button>
      </div>

      {/* Property Wizard */}
      <UploaderWizard
        isOpen={showPropertyWizard}
        onClose={() => setShowPropertyWizard(false)}
        onStartAgain={handleStartAgain}
        uploadedMedia={uploadedUrls}
        onUploadComplete={onUploadComplete}
        selectedContentType={selectedContentType}
      />

      {/* Preview Modal - Shows files after upload with download option before webhook */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onStartAgain={handleStartAgain}
        title="Upload Complete - Preview Your Files"
        actionAtTop={true}
        actionButton={{
          onClick: sendNotification,
          label: selectedContentType === 'video-from-images' 
            ? 'Create Video from Photos' 
            : 'Process Upload & Send Notification'
        }}
      >
        <div className="bg-green-50 border-green-200 text-green-700 rounded-lg border p-4 mb-4">
          Your files have been uploaded successfully! You can preview and download them below.
        </div>
        
        {selectedContentType === 'video-from-images' && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>יצירת סרטון מתמונות</strong>: The photos below will be processed into a video slideshow.
              You can download each photo now, or click the "Create Video from Photos" button at the top.
            </p>
          </div>
        )}
        
        {uploadedUrls.length === 1 ? (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Uploaded Media:</p>
            
            <div className="mb-2 p-3 bg-gray-50 rounded-lg">
              {uploadedUrls[0].mediaType === 'image' ? (
                <img 
                  src={uploadedUrls[0].url} 
                  alt="Uploaded media" 
                  className="max-h-64 max-w-full mx-auto mb-2 rounded" 
                />
              ) : (
                <video 
                  src={uploadedUrls[0].url} 
                  controls 
                  className="max-h-64 max-w-full mx-auto mb-2 rounded"
                />
              )}
              
              <div className="flex justify-between items-center">
                <a 
                  href={uploadedUrls[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline block truncate"
                >
                  {uploadedUrls[0].url.split('/').pop() || 'View uploaded media'}
                </a>
                
                <button
                  onClick={() => handleDownload(uploadedUrls[0].url)}
                  className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download {uploadedUrls[0].mediaType === 'video' ? 'Video' : 'Image'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium mb-3">
              {selectedContentType === 'video-from-images' 
                ? 'Photo Sequence for Video Creation'
                : `Uploaded Items (${uploadedUrls.length}):`}
            </p>
            
            {/* Responsive grid layout: 4 items per row on desktop, 2 on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {uploadedUrls.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg flex flex-col h-full">
                  <div className="flex-grow flex items-center justify-center mb-2">
                    {item.mediaType === 'video' ? (
                      <video 
                        src={item.url} 
                        controls 
                        className="max-h-40 max-w-full rounded" 
                      />
                    ) : (
                      <img 
                        src={item.url} 
                        alt={`Item ${index + 1}`} 
                        className="max-h-40 max-w-full rounded object-cover" 
                      />
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    <p className="text-xs text-gray-500 mb-1 truncate">
                      Item {index + 1}: {item.url && item.url.split('/').pop() || 'media item'}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <a 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View
                      </a>
                      
                      <button
                        onClick={() => handleDownload(item.url)}
                        className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download {item.mediaType === 'video' ? 'Video' : 'Image'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Property Creation Results Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onStartAgain={handleStartAgain}
        title="נכס נשמר בהצלחה!"
      >
        <div className="bg-green-50 border-green-200 text-green-700 rounded-lg border p-4 mb-4">
          {uploadSuccess?.property 
            ? `הנכס "${uploadSuccess.property.title}" נשמר בהצלחה במערכת. כעת ניתן לצפות בו ברשימת הנכסים שלך.`
            : uploadSuccess?.message || 'הנכס נשמר בהצלחה במערכת!'}
        </div>
        
        {uploadSuccess?.isVideoFromImages && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              Your photos will be processed into a video slideshow. The final video will be available in a few minutes.
              You can use the links below to download the individual photos that will make up the video.
            </p>
          </div>
        )}
        
        {/* For single media */}
        {uploadSuccess?.mediaUrl && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Uploaded Media:</p>
            
            <div className="mb-2 p-3 bg-gray-50 rounded-lg">
              {uploadSuccess.mediaType === 'image' ? (
                <img 
                  src={uploadSuccess.mediaUrl} 
                  alt="Uploaded media" 
                  className="max-h-64 max-w-full mx-auto mb-2 rounded" 
                />
              ) : (
                <video 
                  src={uploadSuccess.mediaUrl} 
                  controls 
                  className="max-h-64 max-w-full mx-auto mb-2 rounded"
                />
              )}
              
              <div className="flex justify-between items-center">
                <a 
                  href={uploadSuccess.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline block truncate"
                >
                  {uploadSuccess.mediaUrl.split('/').pop() || 'View uploaded media'}
                </a>
                
                <button
                  onClick={() => handleDownload(uploadSuccess.mediaUrl)}
                  className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download {uploadSuccess.mediaType === 'video' ? 'Video' : 'Image'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* For carousel (multiple media) */}
        {uploadSuccess?.isCarousel && uploadSuccess.mediaUrls && (
          <div>
            <p className="text-sm font-medium mb-3">
              Carousel Items ({uploadSuccess.mediaUrls.length}):
            </p>
            
            {/* Responsive grid layout: 4 items per row on desktop, 2 on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {uploadSuccess.mediaUrls.map((url, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg flex flex-col h-full">
                  <div className="flex-grow flex items-center justify-center mb-2">
                    {(uploadSuccess.mediaTypes && uploadSuccess.mediaTypes[index] === 'video') ? (
                      <video 
                        src={url} 
                        controls 
                        className="max-h-40 max-w-full rounded" 
                      />
                    ) : (
                      <img 
                        src={url} 
                        alt={`Carousel item ${index + 1}`} 
                        className="max-h-40 max-w-full rounded object-cover" 
                      />
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    <p className="text-xs text-gray-500 mb-1 truncate">
                      Item {index + 1}: {url && url.split('/').pop() || 'media item'}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <a 
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View
                      </a>
                      
                      <button
                        onClick={() => handleDownload(url)}
                        className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download {(uploadSuccess.mediaTypes && uploadSuccess.mediaTypes[index] === 'video') ? 'Video' : 'Image'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {uploadSuccess?.contentType && (
          <p className="text-xs text-gray-600 mt-4">
            Content type: {uploadSuccess.contentType}
          </p>
        )}
      </Modal>

      {/* Hebrew Download Modal */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title="אפשרויות הורדה"
        actionAtTop={false}
      >
        <div className="text-black" dir="rtl">
          <p className="mb-4 font-medium">בחר אפשרות הורדה עבור הקובץ שלך:</p>
          
          {downloadItem && (
            <div className="mb-6">
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                {downloadItem.mediaType === 'image' ? (
                  <img 
                    src={downloadItem.url} 
                    alt="Media preview" 
                    className="max-h-64 max-w-full mx-auto mb-4 rounded"
                  />
                ) : (
                  <video 
                    src={downloadItem.url} 
                    controls 
                    className="max-h-64 max-w-full mx-auto mb-4 rounded"
                  />
                )}
                <div className="text-sm text-center text-gray-700">
                  {downloadItem.url.split('/').pop() || 'Media file'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => executeDownload(downloadItem.url)}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  הורד למחשב
                </button>
                
                <a 
                  href={downloadItem.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  פתח בלשונית חדשה
                </a>
              </div>
            </div>
          )}
          
          <div className="border-t pt-4 flex justify-between">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              חזור
            </button>
            <div className="text-sm text-gray-600 self-center">
              © מערכת העלאת מדיה חברתית
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
} 