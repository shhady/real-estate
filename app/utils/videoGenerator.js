import axios from 'axios';

/**
 * Generates a real estate video from images and property data,
 * uploads it to Cloudinary, and sends a webhook notification
 * 
 * @param {Object} listingData - The real estate listing data
 * @returns {Promise<Object>} - The result of the video generation
 */
export const generateRealEstateVideo = async (listingData) => {
  try {
    console.log('Starting video generation for listing:', listingData.listing.title);
    
    // Extract images from mediaTypes (only JPG/PNG)
    const imageUrls = listingData.mediaTypes.filter(url => 
      typeof url === 'string' && 
      (url.toLowerCase().includes('.jpg') || 
      url.toLowerCase().includes('.jpeg') ||
      url.toLowerCase().includes('.png'))
    );
    
    if (imageUrls.length === 0) {
      throw new Error('No valid images found in the listing data');
    }
    
    console.log(`Found ${imageUrls.length} valid images for video generation`);
    
    // Build video configuration using the createVideoConfigFromListing function
    const videoConfig = createVideoConfigFromListing(listingData, imageUrls);
    console.log('Created video configuration');
    
    // Generate the video using the configuration
    console.log('Generating video...');
    const videoBlob = await createVideoFromConfig(videoConfig);
    console.log('Video generated successfully');
    
    // Upload the video to Cloudinary
    console.log('Uploading video to Cloudinary...');
    const videoUrl = await uploadToCloudinary(videoBlob);
    console.log('Video uploaded to Cloudinary:', videoUrl);
    
    // Prepare the result
    const result = {
      status: 'success',
      videoUrl: videoUrl,
      listingId: listingData.listing.title,
      generatedAt: new Date().toISOString()
    };
    
    // Send webhook notification if a webhook URL is provided
    if (listingData.webhookUrl) {
      try {
        console.log('Sending webhook notification to:', listingData.webhookUrl);
        
        // Prepare the payload for the webhook
        const webhookPayload = {
          videoUrl: videoUrl,
          title: listingData.listing.title,
          type: listingData.listing.type,
          location: listingData.listing.location,
          area: listingData.listing.area,
          price: listingData.listing.price,
          rooms: listingData.listing.rooms,
          floor: listingData.listing.floor,
          notes: listingData.listing.notes || '',
          agentName: listingData.agentName,
          phone: listingData.phone,
          agencyName: listingData.agencyName,
          descriptionHE: listingData.descriptionHE || '',
          descriptionAR: listingData.descriptionAR || '',
          languageChoice: listingData.languageChoice,
          mediaTypes: listingData.mediaTypes,
          contentType: 'photosVideo',
          isCarousel: listingData.isCarousel,
          triggerSource: 'json2video',
          executionMode: listingData.executionMode || 'auto',
          generatedAt: result.generatedAt
        };
        
        // Send the webhook notification
        const response = await fetch(listingData.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });
        
        console.log('Webhook notification sent. Response status:', response.status);
        
        // Update the result with webhook status
        result.webhookStatus = response.ok ? 'success' : 'error';
      } catch (webhookError) {
        console.error('Error sending webhook notification:', webhookError);
        result.webhookStatus = 'error';
        result.webhookError = webhookError.message;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error generating real estate video:', error);
    throw error;
  }
};

/**
 * Creates a video configuration from listing data and image URLs
 * 
 * @param {Object} listingData - The real estate listing data
 * @param {Array<string>} imageUrls - The image URLs to use in the video
 * @returns {Object} - The video configuration
 */
function createVideoConfigFromListing(listingData, imageUrls) {
  // This is a placeholder - in a real implementation, this would
  // create a detailed configuration object for the video renderer
  
  // Basic configuration - would be expanded in actual implementation
  return {
    duration: imageUrls.length * 3, // 3 seconds per image
    scenes: imageUrls.map((url, index) => ({
      duration: 3,
      elements: [
        {
          type: 'image',
          url: url,
          position: { x: 0, y: 0 },
          animation: getRandomAnimation()
        },
        {
          type: 'text',
          text: index === 0 ? listingData.listing.title : 
                 (index === imageUrls.length - 1 ? 
                  `${listingData.agentName} - ${listingData.phone}` : 
                  `${listingData.listing.type} - ${listingData.listing.location}`),
          position: { x: 10, y: 10 }
        }
      ]
    }))
  };
}

/**
 * Returns a random animation type for the video
 * 
 * @returns {string} - The animation type
 */
function getRandomAnimation() {
  const animations = [
    'panLeft',
    'panRight',
    'zoomIn',
    'zoomOut',
    'kenBurns',
    'fadeIn'
  ];
  return animations[Math.floor(Math.random() * animations.length)];
}

/**
 * Generates a video from a configuration
 * This is a mock function that would be implemented by the directRenderer library
 * 
 * @param {Object} config - The video configuration
 * @returns {Promise<Blob>} - A video blob
 */
async function createVideoFromConfig(config) {
  // In a real implementation, this would use the imported createVideoFromConfig
  // from the directRenderer library

  console.log('Creating video with configuration:', config);
  
  // Mock implementation - simulate video creation
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return a mock blob
  return new Blob(['video-data'], { type: 'video/webm' });
}

/**
 * Uploads a video blob to Cloudinary
 * This is a mock function that would be implemented by the videoUpload library
 * 
 * @param {Blob} videoBlob - The video blob to upload
 * @returns {Promise<string>} - The URL of the uploaded video
 */
async function uploadToCloudinary(videoBlob) {
  // In a real implementation, this would use the imported uploadToCloudinary
  // from the videoUpload library

  console.log('Uploading video blob to Cloudinary');
  
  // Mock implementation - simulate upload
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return a mock URL
  const timestamp = Date.now();
  return `https://res.cloudinary.com/shhady/video/upload/v${timestamp}/generated_video_${timestamp}.webm`;
} 