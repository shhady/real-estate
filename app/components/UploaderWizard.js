import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { downloadMedia } from '../utils/downloadMedia';
import { generateRealEstateVideo } from '../utils/generateVideoFromPhotos';
import { deleteCloudinaryResource } from '../utils/cloudinaryHelper';
import { cityOptions } from '../utils/cityOptions';

const UploaderWizard = ({ isOpen, onClose, onStartAgain, uploadedMedia = [], onUploadComplete, selectedContentType }) => {
  // State for the wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [error, setError] = useState(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  
  // Generated video URL and public ID from video generation
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPublicId, setVideoPublicId] = useState('');
  const [isVideoMode, setIsVideoMode] = useState(false);

  // Agent selection for collaboration
  const [showAgentSelection, setShowAgentSelection] = useState(false);
  const [matchingAgents, setMatchingAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState({});
  const [savedProperty, setSavedProperty] = useState(null);
  
  console.log('Selected content type:', selectedContentType);
  // Property data
  const [propertyData, setPropertyData] = useState({
    title: '',
    type: 'apartment',
    status: 'For Sale',
    location: '',
    area: '',
    price: '',
    rooms: '',
    bathrooms: '',
    floor: '',
    notes: '',
    agentName: '',
    phone: '',
    agencyName: '',
    collaboration: false
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
  
  // User data state to store complete user information including profile image
  const [userData, setUserData] = useState(null);

  const filteredCities = cityOptions.filter(city =>
    city.label.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  // Fetch user data for agent name, phone, agency name, and profile image
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/users/profile');
        if (res.ok) {
          const fetchedUserData = await res.json();
          setUserData(fetchedUserData); // Store complete user data
          setPropertyData(prev => ({
            ...prev,
            agentName: fetchedUserData.fullName || '',
            phone: fetchedUserData.phone || '',
            agencyName: fetchedUserData.agencyName || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  // Reset wizard when it opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setError(null);
      setVideoUrl('');
      setVideoPublicId('');
      setIsVideoMode(false);
      // Reset property data but preserve agent name, phone, and agency name if they exist
      setPropertyData(prev => ({
        title: '',
        type: 'apartment',
        status: 'For Sale',
        location: '',
        area: '',
        price: '',
        rooms: '',
        bathrooms: '',
        floor: '',
        notes: '',
        agentName: prev.agentName || '',
        phone: prev.phone || '',
        agencyName: prev.agencyName || '',
        collaboration: false
      }));
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

  const handleCitySelect = (cityValue) => {
    setPropertyData(prev => ({ ...prev, location: cityValue }));
    setShowCityDropdown(false);
    setCitySearchTerm('');
  };

  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setPropertyData(prev => ({ ...prev, location: value }));
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
    setCitySearchTerm(propertyData.location);
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
        agencyName: propertyData.agencyName || '',
        userProfileImage: userData?.profileImage?.secure_url || null, // Add user's profile image
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
        agentName: listingData.agentName,
        userProfileImage: listingData.userProfileImage ? 'Profile image available' : 'Using default image',
        languageChoice
      });
      
      // Show detailed log about images being processed
      console.log('Images being processed for video:', imageUrls);
      
      const result = await generateRealEstateVideo(listingData);
      
      // Store the video URL and public ID
      console.log('Video generation completed', result);
      setVideoUrl(result.videoUrl);
      setVideoPublicId(result.videoPublicId);
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

  // Submit the form - this will save the property to MongoDB
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get media URLs and types from the uploaded media
      const mediaUrls = uploadedMedia.map(item => item.url).filter(Boolean);
      const mediaTypes = uploadedMedia.map(item => item.mediaType).filter(Boolean);
      
      // Determine content type
      let selectedContentTypeNormalized = 'single-image';
      if (isVideoMode && selectedContentType === 'video-from-images') {
        selectedContentTypeNormalized = 'video-from-images';
      } else if (mediaUrls.length > 1) {
        selectedContentTypeNormalized = 'carousel';
      } else if (mediaTypes[0] === 'video') {
        selectedContentTypeNormalized = 'video';
      }
      
      console.log("Submitting property with:", {
        isVideoMode,
        selectedContentType,
        selectedContentTypeNormalized,
        mediaUrls: mediaUrls.length,
        videoUrl: !!videoUrl,
        descriptions: !!descriptions
      });
      
      // Build the property payload for MongoDB
      const propertyPayload = {
        listing: propertyData,
        mediaUrls: mediaUrls,
        uploadedMedia: uploadedMedia,
        selectedContentType: selectedContentTypeNormalized,
        descriptions: descriptions,
        descriptionHE: descriptions.hebrew,
        descriptionAR: descriptions.arabic,
        languageChoice: languageChoice,
        videoUrl: videoUrl || null,
        videoPublicId: videoPublicId || null,
        collaboration: propertyData.collaboration // Explicitly include collaboration field
      };
      
      console.log('Saving property to MongoDB...', propertyPayload);
      
      // Save property to MongoDB
      const response = await axios.post('/api/properties', propertyPayload);
      
      if (response.data && response.data.success) {
        console.log('Property saved successfully:', response.data);
        
        // Check if collaboration is enabled and handle agent selection
        if (propertyData.collaboration) {
          console.log('🤝 Collaboration enabled, checking for matching agents...');
          console.log('Property data:', {
            status: propertyData.status,
            location: propertyData.location,
            type: propertyData.type,
            price: propertyData.price,
            rooms: propertyData.rooms
          });
          setSavedProperty(response.data.property);
          
          try {
            // Get matching agents for this property
            const matchResponse = await axios.get(`/api/collaboration-matches?propertyId=${response.data.property._id}&minMatch=5`);
            
            console.log('🔍 API Response:', matchResponse.data);
            
            if (matchResponse.data && matchResponse.data.agents && matchResponse.data.agents.length > 0) {
              const agentData = matchResponse.data.agents;
              
              console.log('✅ Found matching agents:', agentData.length);
              setMatchingAgents(agentData);
              
              // Set all agents as selected by default
              const defaultSelection = {};
              agentData.forEach(agent => {
                defaultSelection[agent._id] = true; // Use _id to match the API response
              });
              setSelectedAgents(defaultSelection);
              
              // Show agent selection UI
              setShowAgentSelection(true);
              return; // Don't close the wizard yet
            }
            
            // If no matches or error, proceed normally
            console.log('❌ No matching agents found, proceeding normally...');
            console.log('Response details:', {
              success: matchResponse.data?.success,
              agentsLength: matchResponse.data?.agents?.length,
              totalAgents: matchResponse.data?.totalAgents
            });
            
          } catch (matchError) {
            console.error('❌ Error checking collaboration matches:', matchError);
            console.error('Error details:', matchError.response?.data);
            // Continue with normal flow if matching fails
          }
        } else {
          console.log('🚫 Collaboration not enabled for this property');
        }
        
        // Close wizard and notify parent component (normal flow)
        onClose();
        if (onUploadComplete) {
          onUploadComplete({
            success: true,
            property: response.data.property,
            contentType: selectedContentTypeNormalized,
            mediaUrls,
            message: 'הנכס נשמר בהצלחה במערכת!'
          });
        }
      } else {
        setError('אירעה שגיאה בעת שמירת הנכס. אנא נסה שנית.');
      }
    } catch (err) {
      console.error('Error saving property:', err, err.response?.data);
      
      setError(`שגיאה בשמירת הנכס: ${err.response?.data?.error || err.message}. אנא נסה שנית או פנה לתמיכה.`);
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
        
        // Clear the video URL and public ID
        setVideoUrl('');
        setVideoPublicId('');
        
        alert('הסרטון נמחק בהצלחה.');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert(`שגיאה במחיקת הסרטון: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle agent selection
  const handleAgentToggle = (agentId) => {
    setSelectedAgents(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
  };

  // Send collaboration emails to selected agents
  const sendCollaborationEmails = async () => {
    setIsLoading(true);
    try {
      const selectedAgentIds = Object.keys(selectedAgents).filter(id => selectedAgents[id]);
      
      if (selectedAgentIds.length === 0) {
        setError('אנא בחר לפחות סוכן אחד לשליחת מייל');
        setIsLoading(false);
        return;
      }

      console.log('🤝 Sending collaboration emails to selected agents:', selectedAgentIds);
      
      // Send emails via collaboration API
      const emailResponse = await axios.post('/api/send-collaboration-emails', {
        propertyId: savedProperty._id,
        selectedAgentIds: selectedAgentIds
      });

      if (emailResponse.data && emailResponse.data.success) {
        console.log('✅ Collaboration emails sent successfully');
        
        // Close wizard and notify success
        setShowAgentSelection(false);
        onClose();
        if (onUploadComplete) {
          onUploadComplete({
            success: true,
            property: savedProperty,
            contentType: selectedContentType,
            mediaUrls: uploadedMedia.map(item => item.url),
            message: `הנכס נשמר בהצלחה ונשלחו מיילים ל-${selectedAgentIds.length} סוכנים!`,
            collaborationSent: true,
            agentCount: selectedAgentIds.length
          });
        }
      } else {
        setError('שגיאה בשליחת מיילים לסוכנים');
      }
      
    } catch (error) {
      console.error('Error sending collaboration emails:', error);
      setError('שגיאה בשליחת מיילים לסוכנים');
    } finally {
      setIsLoading(false);
    }
  };

  // Skip collaboration and close wizard
  const skipCollaboration = () => {
    setShowAgentSelection(false);
    onClose();
    if (onUploadComplete) {
      onUploadComplete({
        success: true,
        property: savedProperty,
        contentType: selectedContentType,
        mediaUrls: uploadedMedia.map(item => item.url),
        message: 'הנכס נשמר בהצלחה במערכת!',
        collaborationSent: false
      });
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
                {/* <p className="text-xs text-gray-500">כולל שם הסוכנות GoldenKey</p> */}
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
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  סטטוס <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={propertyData.status}
                  onChange={handleInputChange}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="For Sale">למכירה</option>
                  <option value="For Rent">להשכרה</option>
                </select>
              </div>
              
              <div className="space-y-2 relative">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  מיקום <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={propertyData.location}
                  onChange={handleLocationInputChange}
                  onFocus={handleLocationInputFocus}
                  onBlur={handleLocationInputBlur}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="עיר, שכונה או כתובת מלאה"
                  required
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
              
              <div className="space-y-2">
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                  חדרי אמבטיה
                </label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={propertyData.bathrooms}
                  onChange={handleInputChange}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2"
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
              
              {/* Collaboration checkbox */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="collaboration"
                    name="collaboration"
                    checked={propertyData.collaboration}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, collaboration: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="collaboration" className="text-sm font-medium text-gray-700 mr-3">
                    🤝 מוכן לשיתוף פעולה עם סוכנים אחרים
                  </label>
                </div>
                <p className="text-xs text-gray-500 mr-7">
                  הפעלת אפשרות זו תאפשר לסוכנים אחרים לראות את הנכס ולהציע לקוחות מתאימים
                </p>
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
                    תהליך זה ייצר סרטון בו כל תמונה מוצגת למשך כמה שניות, עם אנימציות ומידע על הנכס
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
                שמור נכס במערכת
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
                שמור נכס במערכת
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
    <Modal isOpen={isOpen} onClose={onClose} title="אשף העלאת נכסים">
      <div className="max-w-4xl mx-auto">
        {/* Agent Selection Overlay */}
        {showAgentSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto" dir="rtl">
              <div className="p-6 sm:p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    🤝 בחר סוכנים לשיתוף פעולה
                  </h3>
                  
                  <p className="text-gray-600 text-lg leading-relaxed">
                    נמצאו {matchingAgents.length} סוכנים עם לקוחות שמתאימים לנכס שלך.
                    בחר לאילו סוכנים לשלוח הודעת שיתוף פעולה:
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
                  {matchingAgents.map((agent) => (
                    <div key={agent._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`agent-${agent._id}`}
                          checked={selectedAgents[agent._id] || false}
                          onChange={() => handleAgentToggle(agent._id)}
                          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ml-4"
                        />
                        <label htmlFor={`agent-${agent._id}`} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-1">{agent.fullName}</h4>
                              <p className="text-gray-600 mb-1">{agent.agencyName}</p>
                              <p className="text-sm text-blue-600 font-medium">
                                {agent.matchingClients.length} לקוח{agent.matchingClients.length > 1 ? 'ות' : ''} מתאים{agent.matchingClients.length > 1 ? 'ים' : ''}
                              </p>
                            </div>
                            <div className="text-left ml-4">
                              <p className="text-sm text-gray-500 mb-1">{agent.email}</p>
                              {agent.phone && (
                                <p className="text-sm text-gray-500">{agent.phone}</p>
                              )}
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <button
                    onClick={skipCollaboration}
                    className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                    disabled={isLoading}
                  >
                    דלג על שיתוף פעולה
                  </button>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const allSelected = {};
                        matchingAgents.forEach(agent => {
                          allSelected[agent._id] = true;
                        });
                        setSelectedAgents(allSelected);
                      }}
                      className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      disabled={isLoading}
                    >
                      בחר הכל
                    </button>
                    
                    <button
                      onClick={() => {
                        const noneSelected = {};
                        matchingAgents.forEach(agent => {
                          noneSelected[agent._id] = false;
                        });
                        setSelectedAgents(noneSelected);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                      disabled={isLoading}
                    >
                      בטל הכל
                    </button>
                    
                    <button
                      onClick={sendCollaborationEmails}
                      className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={isLoading || Object.values(selectedAgents).filter(Boolean).length === 0}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                          שולח...
                        </div>
                      ) : (
                        `שלח ל-${Object.values(selectedAgents).filter(Boolean).length} סוכנים`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of the wizard */}
        {!showAgentSelection && (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" dir="rtl">
                {error}
              </div>
            )}

            {renderStepContent()}
            {renderNavigationButtons()}
          </>
        )}
      </div>

      {/* Download Modal */}
      {showDownloadModal && downloadItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4" dir="rtl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">הורדת מדיה</h3>
              <p className="text-gray-600 mb-6">
                האם ברצונך להוריד את הקובץ: {downloadItem.fileName || 'קובץ ללא שם'}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  ביטול
                </button>
                <button
                  onClick={() => executeDownload(downloadItem.url)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  הורד
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default UploaderWizard; 