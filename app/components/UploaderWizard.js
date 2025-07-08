import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { downloadMedia } from '../utils/downloadMedia';
import { generateRealEstateVideo } from '../utils/generateVideoFromPhotos';
import { deleteCloudinaryResource } from '../utils/cloudinaryHelper';

const UploaderWizard = ({ isOpen, onClose, onStartAgain, uploadedMedia = [], onUploadComplete, selectedContentType }) => {
  // State for the wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [error, setError] = useState(null);
  
  // Generated video URL from JSON2Video
  const [videoUrl, setVideoUrl] = useState('');
  const [isVideoMode, setIsVideoMode] = useState(false);

  console.log('Selected content type:', selectedContentType);
  // Property data
  const [propertyData, setPropertyData] = useState({
    title: 'חדש ב GoldenKey - ',
    type: 'apartment',
    location: '',
    area: '',
    price: '',
    rooms: '',
    floor: '',
    notes: '',
    agentName: '',
    phone: '',
    agencyName: 'GoldenKey'
  });

  // Character counter for description
  const [charCount, setCharCount] = useState({
    hebrew: 0,
    arabic: 0
  });

  // Generated descriptions
  const [descriptions, setDescriptions] = useState({
    arabic: '',
    hebrew: ''
  });

  // Selected language choice for publishing
  const [languageChoice, setLanguageChoice] = useState('both');
  
  // Download modal state
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadItem, setDownloadItem] = useState(null);

  // Video generation status
  const [videoGenerationStatus, setVideoGenerationStatus] = useState("preparing");

  // Reset wizard when it opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setError(null);
      setVideoUrl('');
      setIsVideoMode(false);
      setPropertyData({
        title: 'חדש ב GoldenKey - ',
        type: 'apartment',
        location: '',
        area: '',
        price: '',
        rooms: '',
        floor: '',
        notes: '',
        agentName: '',
        phone: '',
        agencyName: 'GoldenKey'
      });
      setLanguageChoice('both');
      setCharCount({
        hebrew: 0,
        arabic: 0
      });
    }
  }, [isOpen]);

  // Update character count when descriptions change
  useEffect(() => {
    setCharCount({
      hebrew: descriptions.hebrew?.length || 0,
      arabic: descriptions.arabic?.length || 0
    });
  }, [descriptions]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPropertyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate descriptions based on property data
  const generateDescriptions = async () => {
    setIsGeneratingDescription(true);
    setError(null);
    
    try {
      // Create a copy of propertyData with the phone field mapped to agentPhone
      const dataToSend = {
        ...propertyData,
        agentPhone: propertyData.phone // Explicitly set agentPhone to match the phone field
      };
      
      console.log('Sending data to API:', dataToSend); // For debugging
      
      // Call the API to generate descriptions
      const response = await axios.post('/api/generate-description', dataToSend);
      
      if (response.data && response.data.success) {
        // Ensure descriptions don't exceed 2000 characters
        const truncatedDescriptions = {
          hebrew: response.data.descriptions.hebrew?.substring(0, 2000) || '',
          arabic: response.data.descriptions.arabic?.substring(0, 2000) || ''
        };
        setDescriptions(truncatedDescriptions);
      } else {
        setError('שגיאה ביצירת התיאורים. אנא נסה שנית.');
      }
      
      // Move to next step automatically if we're not in video mode
      if (!isVideoMode) {
        setCurrentStep(3);
      }
    } catch (err) {
      console.error('Error generating descriptions:', err);
      setError('שגיאה ביצירת התיאורים. אנא נסה שנית.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Process the "video-from-images" flow
  const processVideoFromImages = async () => {
    setIsGeneratingVideo(true);
    setError(null);
    setVideoGenerationStatus("preparing");

    try {
      // Get image URLs from the uploaded media (filter out videos)
      const imageUrls = uploadedMedia
        .filter(item => item.mediaType === 'image')
        .map(item => item.url);

      if (imageUrls.length === 0) {
        setError('לא נמצאו תמונות ליצירת סרטון וידאו. אנא העלה תמונות ונסה שנית.');
        setIsGeneratingVideo(false);
        return;
      }

      console.log('Processing video from images:', imageUrls.length);
      
      // Validate that we have at least one image
      if (imageUrls.length < 1) {
        setError('נדרשת לפחות תמונה אחת ליצירת הוידאו. אנא העלה תמונות נוספות.');
        setIsGeneratingVideo(false);
        return;
      }
      
      // Always use Hebrew only, per requirement
      const effectiveLanguageChoice = 'he';
      
      // Create the listing data object for video generation
      const listingData = {
        listing: propertyData,
        agentName: propertyData.agentName,
        phone: propertyData.phone,
        agencyName: propertyData.agencyName || 'GoldenKey',
        descriptionHE: descriptions.hebrew,
        // We're not using Arabic descriptions anymore
        languageChoice: effectiveLanguageChoice,
        mediaTypes: imageUrls,
        contentType: 'photosVideo',
        isCarousel: true,
        webhookUrl: process.env.WEBHOOK_URL,
        executionMode: 'auto',
        overlay: true,
        triggerSource: 'UploaderWizard'
      };
      
      // Generate the video
      setVideoGenerationStatus("generating");
      console.log('Generating video from images with listing data', {
        imageCount: imageUrls.length,
        propertyTitle: listingData.listing.title,
        propertyLocation: listingData.listing.location,
        languageChoice
      });
      
      // Show detailed log about images being processed
      console.log('Images being processed for video:', imageUrls);
      
      const result = await generateRealEstateVideo(listingData);
      
      // Store the video URL
      console.log('Video generation completed', result);
      setVideoUrl(result.videoUrl);
      setVideoGenerationStatus("completed");
      
      // Move to step 4 to show completion
      setCurrentStep(4);
      
    } catch (err) {
      console.error('Error processing video from images:', err);
      setError('שגיאה ביצירת הוידאו מהתמונות. אנא נסה שנית.');
      setVideoGenerationStatus("error");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Submit the form - this will process the upload notification with the additional data
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get media URLs and types from the uploaded media
      const mediaUrls = uploadedMedia.map(item => item.url).filter(Boolean);
      const mediaTypes = uploadedMedia.map(item => item.mediaType).filter(Boolean);
      
      // Determine if it's a carousel or single upload
      const isCarousel = mediaUrls.length > 1;
      
      // Check if we're in video-from-photos mode (now just a collection of images)
      const isVideoFromPhotos = isVideoMode;
      
      console.log("Submitting form with mode:", {
        isVideoMode,
        isVideoFromPhotos,
        mediaUrls: mediaUrls.length,
        descriptions: !!descriptions
      });
      
      // Build the payload with the collected data
      const payload = {
        clientId: propertyData.clientId || 'clientIdFromSession',
        mediaUrls: mediaUrls,
        mediaTypes: mediaTypes,
        contentType: isVideoFromPhotos ? 'photosVideo' : (isCarousel ? 'Carousel' : mediaTypes[0]),
        overlay: true,
        listing: propertyData,
        languageChoice
      };
      
      // If a video URL is available, include it in the payload
      if (videoUrl) {
        payload.videoUrl = videoUrl;
        payload.contentType = 'photosVideo'; // Ensure content type is correct when video is available
      }
      
      console.log('Setting content type:', {
        contentType: payload.contentType,
        isVideoMode,
        isVideoFromPhotos,
        isCarousel,
        mediaCount: mediaUrls.length,
        hasVideoUrl: !!videoUrl
      });
      
      // For image collection mode, only send the specific language descriptions
      if (isVideoFromPhotos) {
        // Include specific Hebrew and Arabic descriptions directly
        if (descriptions.hebrew) payload.descriptionHE = descriptions.hebrew;
        if (descriptions.arabic) payload.descriptionAR = descriptions.arabic;
        
        // Log the payload for debugging
        console.log('Video from images payload:', {
          contentType: payload.contentType,
          descriptionHE: !!payload.descriptionHE,
          descriptionAR: !!payload.descriptionAR
        });
      } else {
        // For regular uploads, use the description object
        payload.description = descriptions;
      }
      
      // Send notification to the appropriate endpoint
      const endpoint = isCarousel || isVideoFromPhotos ? '/api/notify-carousel' : '/api/notify-upload';
      console.log(`Sending notification to ${endpoint}`, { isCarousel, isVideoFromPhotos });
      
      const response = await axios.post(endpoint, payload);
      
      // Handle response
      if (response.data && response.data.success) {
        // Save listing data to Google Sheets and MongoDB
        try {
          console.log('Saving listing data to Google Sheets and MongoDB...');
          const saveResponse = await axios.post('/api/save-listing', payload);
          console.log('Save listing response:', saveResponse.data);
        } catch (saveError) {
          console.error('Error saving listing data:', saveError);
          // Continue with the process even if saving fails - don't block the user
        }
        
        // Close wizard and notify parent component
        onClose();
        if (onUploadComplete) {
          onUploadComplete({
            success: true,
            isCarousel,
            isVideoFromPhotos,
            mediaUrls,
            webhook: response.data.webhookSent,
            message: response.data.message
          });
        }
      } else {
        setError('אירעה שגיאה בעת עיבוד ההעלאה. אנא נסה שנית.');
      }
    } catch (err) {
      console.error('Error submitting form:', err, err.response?.data);
      
      setError(`שגיאה בעיבוד ההעלאה: ${err.response?.data?.error || err.message}. אנא נסה שנית או פנה לתמיכה.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Go to next step
  const handleNext = () => {
    if (currentStep === 1) {
      // Check if we're in video-from-photos mode (multiple images)
      const hasMultipleImages = uploadedMedia.filter(item => item.mediaType === 'image').length > 1;
      setIsVideoMode(hasMultipleImages && selectedContentType === 'video-from-images');
      console.log('Video mode enabled:', hasMultipleImages && selectedContentType === 'video-from-images');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate required fields
      if (!propertyData.title || !propertyData.location || !propertyData.area || !propertyData.price || !propertyData.agentName || !propertyData.phone) {
        setError('אנא מלא את כל השדות המסומנים בכוכבית');
        return;
      }
      
      // Different flows for video-from-photos vs regular uploads
      if (isVideoMode && selectedContentType === 'video-from-images') {
        // Move to step 3 to generate descriptions first, then video
        setCurrentStep(3);
        // We'll generate descriptions in step 3
      } else {
        // Regular flow - move to step 3 for language selection and descriptions
        setCurrentStep(3);
        generateDescriptions();
      }
    } else if (currentStep === 3) {
      // If we're in video-from-photos mode, show the loading state and start processing
      if (isVideoMode && selectedContentType === 'video-from-images') {
        // Set loading state before moving to step 4
        setIsGeneratingVideo(true);
        setVideoGenerationStatus("preparing");
        setCurrentStep(4);
        
        // Start the video generation process
        setTimeout(() => {
          processVideoFromImages();
        }, 100);
      } else {
        // For regular mode, just move to step 4
        setCurrentStep(4);
      }
    } else {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  // Go to previous step
  const handleBack = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };
  
  // Handle media download
  const handleDownload = (item) => {
    setDownloadItem(item);
    setShowDownloadModal(true);
  };
  
  // Execute download
  const executeDownload = (url) => {
    downloadMedia(url);
    setShowDownloadModal(false);
  };

  // Handle video deletion
  const handleDeleteVideo = async (videoUrl) => {
    if (!videoUrl) return;
    
    try {
      if (confirm('האם אתה בטוח שברצונך למחוק את הסרטון? פעולה זו אינה ניתנת לשחזור.')) {
        setIsLoading(true);
        
        // Attempt to delete from Cloudinary
        const result = await deleteCloudinaryResource(videoUrl);
        console.log('Video deletion result:', result);
        
        // Clear the video URL
        setVideoUrl('');
        
        alert('הסרטון נמחק בהצלחה.');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert(`שגיאה במחיקת הסרטון: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4" dir="rtl">
            <h3 className="text-lg font-medium text-black">שלב 1: תצוגה מקדימה של המדיה</h3>
            <p className="text-gray-600">צפה במדיה שהועלתה לפני המשך התהליך</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {uploadedMedia.map((item, index) => (
                <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                  {item.mediaType === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={`Uploaded media ${index + 1}`} 
                      className="w-full h-48 object-cover"
                    />
                  ) : item.mediaType === 'video' ? (
                    <video 
                      src={item.url} 
                      controls 
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">סוג מדיה לא נתמך</span>
                    </div>
                  )}
                  <div className="p-2 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {item.fileName || `מדיה ${index + 1}`}
                    </span>
                    <button 
                      onClick={() => handleDownload(item)}
                      className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      הורדה
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4" dir="rtl">
            <h3 className="text-lg font-medium text-black">שלב 2: פרטי הנכס</h3>
            <p className="text-gray-600">הזן מידע על הנכס</p>
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  כותרת <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={propertyData.title}
                  onChange={handleInputChange}    
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="כותרת הנכס"
                  required
                />
                <p className="text-xs text-gray-500">כולל שם הסוכנות GoldenKey</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="agentName" className="block text-sm font-medium text-gray-700">
                  שם הסוכן <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="agentName"
                  name="agentName"
                  value={propertyData.agentName}
                  onChange={handleInputChange}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="שם הסוכן"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  מספר טלפון <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={propertyData.phone}
                  onChange={handleInputChange}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="050-1234567"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  סוג נכס <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={propertyData.type}
                  onChange={handleInputChange}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="apartment">דירה</option>
                  <option value="house">בית</option>
                  <option value="villa">וילה</option>
                  <option value="office">משרד</option>
                  <option value="store">חנות</option>
                  <option value="land">קרקע</option>
                  <option value="warehouse">מחסן</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  מיקום <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={propertyData.location}
                  onChange={handleInputChange}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="עיר, שכונה או כתובת מלאה"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                  שטח (מ"ר) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={propertyData.area}
                  onChange={handleInputChange}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="120"
                  min="0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  מחיר <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={propertyData.price}
                  onChange={handleInputChange}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="₪1,250,000"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="rooms" className="block text-sm font-medium text-gray-700">
                  חדרים
                </label>
                <input
                  type="number"
                  id="rooms"
                  name="rooms"
                  value={propertyData.rooms}
                  onChange={handleInputChange}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="4"
                  min="0"
                />
              </div>
              
              {propertyData.type === 'apartment' && (
                <div className="space-y-2">
                  <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
                    קומה
                  </label>
                  <input
                    type="number"
                    id="floor"
                    name="floor"
                    value={propertyData.floor}
                    onChange={handleInputChange}
                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="3"
                    min="0"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  הערות
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={propertyData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="מידע נוסף על הנכס"
                ></textarea>
              </div>
            </form>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4" dir="rtl">
            <h3 className="text-lg font-medium text-black">
              {isVideoMode 
                ? "שלב 3: יצירת תיאורים לתמונות" 
                : "שלב 3: בחירת שפה ואפשרויות פרסום"}
            </h3>
            
            {isGeneratingDescription ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-6 text-lg text-gray-700 font-medium">מכין תיאור...</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600">
                  {isVideoMode 
                    ? "יצירת תיאורים שילוו את אוסף התמונות שלך" 
                    : "איזו גרסה תרצה לפרסם?"}
                </p>
                
                {isVideoMode && !descriptions.hebrew && !descriptions.arabic && (
                  <div className="mb-6 text-center">
                    <button
                      onClick={generateDescriptions}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      יצירת תיאורים אוטומטיים
                    </button>
                  </div>
                )}
                
                <div className="space-y-6 mt-4 text-black">
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="languageChoice"
                          value="arabic"
                          checked={languageChoice === 'arabic'}
                          onChange={() => setLanguageChoice('arabic')}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="font-medium mr-2">ערבית בלבד 🇸🇦</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="languageChoice"
                          value="hebrew"
                          checked={languageChoice === 'hebrew'}
                          onChange={() => setLanguageChoice('hebrew')}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="font-medium mr-2">עברית בלבד 🇮🇱</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="languageChoice"
                          value="both"
                          checked={languageChoice === 'both'}
                          onChange={() => setLanguageChoice('both')}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="font-medium mr-2">שתי השפות 🌐</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {(descriptions.hebrew || descriptions.arabic) && (
                      <h4 className="font-medium">תצוגה מקדימה של התיאורים שנוצרו:</h4>
                    )}
                    <p className="text-xs text-gray-500">* האורך האידיאלי הוא 800-1000 תווים. מגבלת מקסימום: 2000 תווים.</p>
                    
                    {(languageChoice === 'arabic' || languageChoice === 'both') && descriptions.arabic && (
                      <div className="border rounded-md p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium">תיאור בערבית:</h5>
                          <span className={`text-xs ${charCount.arabic > 2000 ? 'text-red-500' : charCount.arabic > 1000 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {charCount.arabic}/2000 תווים
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 max-h-48 overflow-y-auto rtl" dir="rtl">
                          {descriptions.arabic || "לא נוצר תיאור בערבית."}
                        </div>
                      </div>
                    )}
                    
                    {(languageChoice === 'hebrew' || languageChoice === 'both') && descriptions.hebrew && (
                      <div className="border rounded-md p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium">תיאור בעברית:</h5>
                          <span className={`text-xs ${charCount.hebrew > 2000 ? 'text-red-500' : charCount.hebrew > 1000 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {charCount.hebrew}/2000 תווים
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 max-h-48 overflow-y-auto rtl" dir="rtl">
                          {descriptions.hebrew || "לא נוצר תיאור בעברית."}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {isVideoMode && (descriptions.hebrew || descriptions.arabic) && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-md">
                    <p className="text-blue-700 font-medium">התיאורים נוצרו בהצלחה! כעת נמשיך להכנת אוסף התמונות לפרסום.</p>
                  </div>
                )}
              </>
            )}
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4" dir="rtl">
            <h3 className="text-lg font-medium text-black">שלב 4: סקירת תמונות לפרסום</h3>
            
            {isGeneratingVideo ? (
              <div className="text-center py-8">
                <div className="mb-6 flex flex-col items-center">
                  <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-t-2 border-blue-500 mx-auto"></div>
                  <div className="mt-8 bg-gray-100 w-full max-w-md h-2 rounded-full overflow-hidden">
                    {videoGenerationStatus === "preparing" && (
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '25%' }}></div>
                    )}
                    {videoGenerationStatus === "generating" && (
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }}></div>
                    )}
                    {videoGenerationStatus === "completed" && (
                      <div className="bg-green-500 h-full rounded-full" style={{ width: '100%' }}></div>
                    )}
                  </div>
                  <div className="flex w-full max-w-md justify-between mt-2 text-xs text-gray-500">
                    <span>הכנה</span>
                    <span>יצירת וידאו</span>
                    <span>העלאה</span>
                    <span>סיום</span>
                  </div>
                </div>
                <p className="mt-6 text-lg text-gray-700 font-medium">
                  {videoGenerationStatus === "preparing" && "מכין את הנתונים ליצירת וידאו..."}
                  {videoGenerationStatus === "generating" && "מייצר וידאו מהתמונות באמצעות HTML Canvas..."}
                  {videoGenerationStatus === "completed" && "הוידאו נוצר בהצלחה!"}
                  {videoGenerationStatus === "error" && "שגיאה ביצירת הוידאו"}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {videoGenerationStatus === "preparing" && "מכין את התמונות והמידע..."}
                  {videoGenerationStatus === "generating" && "יוצר את הסרטון מהתמונות באמצעות Canvas. תהליך זה עשוי להימשך מספר שניות..."}
                  {videoGenerationStatus === "completed" && "מייד תועבר לתצוגת הוידאו המוכן"}
                  {videoGenerationStatus === "error" && "אנא נסה שנית או בדוק את הקונסול לפרטים נוספים"}
                </p>
                {videoGenerationStatus === "generating" && (
                  <p className="mt-4 text-sm text-blue-600">
                    תהליך זה ייצר סרטון בו כל תמונה מוצגת למשך 5 שניות, עם אנימציות ומידע על הנכס
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="bg-green-50 border-green-200 text-green-700 rounded-lg border p-4 mb-4">
                  <p className="text-sm font-medium">
                    <span className="inline-block ml-1">✅</span>
                    {videoUrl 
                      ? 'סרטון הוידאו נוצר בהצלחה! ניתן לצפות בו ולהוריד אותו.' 
                      : 'התמונות מוכנות לפרסום! התמונות יפורסמו באוסף תמונות מסוג Image Collection.'}
                  </p>
                </div>
                
                {/* Show video player if video URL is available */}
                {videoUrl && (
                  <div className="border rounded-lg overflow-hidden shadow-md mb-6">
                    <h4 className="bg-gray-100 p-3 font-medium">סרטון וידאו שנוצר:</h4>
                    <div className="p-4">
                      <video 
                        src={videoUrl} 
                        controls
                        className="w-full h-auto rounded"
                        poster={uploadedMedia[0]?.url}
                      />
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={() => executeDownload(videoUrl)}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          הורד את הסרטון
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(videoUrl)}
                          className="flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors mr-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          מחק סרטון
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-6 mt-4 text-black">
                  <div className="border rounded-lg overflow-hidden shadow-md">
                    <h4 className="bg-gray-100 p-3 font-medium">תצוגה מקדימה של התמונות:</h4>
                    <div className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {uploadedMedia
                          .filter(item => item.mediaType === 'image')
                          .map((item, index) => (
                            <div key={index} className="rounded-md overflow-hidden border">
                              <img 
                                src={item.url} 
                                alt={`Uploaded media ${index + 1}`} 
                                className="w-full h-32 object-cover"
                              />
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">התיאורים שיפורסמו עם התמונות:</h4>
                    
                    {(languageChoice === 'arabic' || languageChoice === 'both') && (
                      <div className="border rounded-md p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium">תיאור בערבית:</h5>
                          <span className={`text-xs ${charCount.arabic > 2000 ? 'text-red-500' : charCount.arabic > 1000 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {charCount.arabic}/2000 תווים
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 max-h-48 overflow-y-auto rtl" dir="rtl">
                          {descriptions.arabic || "לא נוצר תיאור בערבית."}
                        </div>
                      </div>
                    )}
                    
                    {(languageChoice === 'hebrew' || languageChoice === 'both') && (
                      <div className="border rounded-md p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium">תיאור בעברית:</h5>
                          <span className={`text-xs ${charCount.hebrew > 2000 ? 'text-red-500' : charCount.hebrew > 1000 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {charCount.hebrew}/2000 תווים
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 max-h-48 overflow-y-auto rtl" dir="rtl">
                          {descriptions.hebrew || "לא נוצר תיאור בעברית."}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  // Get action button label
  const getActionButtonLabel = () => {
    if (currentStep === 3 || currentStep === 4) return 'סיום ושליחה';
    return currentStep >= 1 ? 'הבא' : 'Next';
  };

  // Get action button handler
  const getActionButtonHandler = () => {
    if (currentStep === 3 || currentStep === 4) return handleSubmit;
    return handleNext;
  };
  
  // Render navigation buttons based on current step
  const renderNavigationButtons = () => {
    if (currentStep === 1) {
      return (
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-base"
          >
            הבא
          </button>
          
          <div></div> {/* Spacer for flex alignment */}
        </div>
      );
    } else if (currentStep === 2) {
      return (
        <div className="flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-base"
          >
            הבא
          </button>
          
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors text-base"
          >
            חזרה
          </button>
        </div>
      );
    } else if (currentStep === 3) {
      if (isGeneratingDescription) {
        return null; // No buttons while generating descriptions
      }
      
      if (isVideoMode) {
        // For video mode, show Next button only if descriptions are generated
        const canContinue = descriptions.hebrew || descriptions.arabic;
        
        return (
          <div className="flex justify-between items-center">
            {canContinue ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-base"
              >
                המשך 
                <span className="mr-1">🎬</span>
              </button>
            ) : 
              <div></div> /* Empty div to maintain layout */
            }
            
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors text-base"
            >
              חזרה
            </button>
          </div>
        );
      } else {
        // For regular uploads, show submit button
        return (
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  מעבד...
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="ml-2">✅</span>
                  העלה למדיה חברתית
                </span>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors text-base"
            >
              חזרה
            </button>
          </div>
        );
      }
    } else if (currentStep === 4) {
      if (isGeneratingVideo) {
        return (
          <div className="flex justify-center">
            <div className="text-base text-gray-600 bg-gray-100 px-4 py-2 rounded-md">
              מעבד את התמונות...
            </div>
          </div>
        );
      }
      
      return (
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                מעבד...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="ml-2">✅</span>
                פרסם תמונות למדיה חברתית
              </span>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors text-base"
            disabled={isGeneratingVideo}
          >
            חזרה
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onStartAgain={onStartAgain}
        title={
          isVideoMode 
            ? `פרסום אוסף תמונות - צעד ${currentStep} מתוך 4` 
            : currentStep >= 1 
              ? ` העלאה - שלב ${currentStep} מתוך 3`
              : `Upload Wizard - Step ${currentStep} of 3`
        }
        closeButtonText={currentStep >= 1 ? 'סגור' : 'Close'}
        startAgainButtonText={currentStep >= 1 ? 'התחל מחדש' : 'Start Again'}
        isRtl={currentStep >= 1}
      >
        <div className={`py-2 ${currentStep >= 1 ? 'rtl-content' : ''}`}>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${(currentStep / (isVideoMode ? 4 : 3)) * 100}%` }}
            ></div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className={`mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md ${currentStep >= 1 ? 'text-right' : ''}`}>
              {error}
            </div>
          )}
          
          {/* Step content */}
          {renderStepContent()}
          
          {/* Navigation buttons in a fixed height container */}
          <div className="mt-6 h-16 flex items-center">
            {renderNavigationButtons()}
          </div>
        </div>
      </Modal>
      
      {/* Hebrew Download Modal */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title="אפשרויות הורדה"
        closeButtonText="סגור"
        startAgainButtonText="התחל מחדש"
        isRtl={true}
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
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
                  className="flex items-center justify-center px-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  פתח בלשונית חדשה
                </a>
              </div>
            </div>
          )}
          
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              חזור למסך הקודם
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UploaderWizard; 