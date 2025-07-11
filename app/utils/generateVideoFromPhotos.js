/**
 * Real Estate Video Generator
 * Generates a video from property images and data with Hebrew and Arabic support
 */

/**
 * Generates a video for a real estate listing
 * @param {Object} listingData - The real estate listing data
 * @returns {Promise<Object>} - Object with the generated video URL and status
 */
export const generateRealEstateVideo = async (listingData) => {
  try {
    console.log('Generating video for listing:', listingData.listing.title);
    console.log('Agent profile image:', listingData.userProfileImage ? 'Custom profile image' : 'Using default image');
    
    // Extract images from mediaTypes
    const imageUrls = listingData.mediaTypes.filter(item => 
      typeof item === 'string' && (item.includes('.jpg') || item.includes('.png') || item.includes('.jpeg'))
    );
    
    if (imageUrls.length === 0) {
      throw new Error('No valid images found in the listing data');
    }
    
    // Analyze images to determine optimal video format
    const optimalFormat = await determineOptimalVideoFormat(imageUrls);
    console.log('Optimal video format determined:', optimalFormat);
    
    // Create video configuration with dynamic dimensions
    const videoConfig = createVideoConfigFromListing(listingData, imageUrls, optimalFormat);
    
    // Generate video using direct renderer with dynamic dimensions
    console.log('Creating video from config...');
    const videoBlob = await createVideoFromConfig(videoConfig, optimalFormat.width, optimalFormat.height, 30);
    
    // Upload to Cloudinary
    console.log('Uploading video to Cloudinary...');
    const uploadResult = await uploadToCloudinary(videoBlob);
    const videoUrl = uploadResult.secure_url;
    
    // If webhookUrl is provided, send a notification
    if (listingData.webhookUrl) {
      try {
        // Make a request to the webhook URL
        console.log('Sending webhook notification to:', listingData.webhookUrl);
        const response = await fetch(listingData.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoUrl,
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
            generatedAt: new Date().toISOString()
          }),
        });
        console.log('Webhook response:', response.status);
      } catch (webhookError) {
        // Just log webhook errors, don't fail the whole process
        console.error('Error sending webhook notification:', webhookError);
      }
    }
    
    return {
      status: 'success',
      videoUrl,
      videoPublicId: uploadResult.public_id,
      listingId: listingData.listing.title,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in video generation:', error);
    throw error;
  }
};

/**
 * Analyzes images to determine the optimal video format
 * @param {Array<string>} imageUrls - Array of image URLs
 * @returns {Promise<Object>} - Optimal video format configuration
 */
async function determineOptimalVideoFormat(imageUrls) {
  console.log('Analyzing image dimensions for optimal video format...');
  
  try {
    // Load the first few images to analyze their dimensions
    const imagesToAnalyze = imageUrls.slice(0, Math.min(3, imageUrls.length));
    const imageAnalysis = [];
    
    for (const url of imagesToAnalyze) {
      try {
        const dimensions = await getImageDimensions(url);
        imageAnalysis.push({
          url,
          width: dimensions.width,
          height: dimensions.height,
          aspectRatio: dimensions.width / dimensions.height
        });
      } catch (error) {
        console.warn(`Failed to analyze image ${url}:`, error);
      }
    }
    
    if (imageAnalysis.length === 0) {
      // Fallback to standard format if no images can be analyzed
      return {
        width: 1920,
        height: 1080,
        aspectRatio: 16/9,
        format: 'landscape',
        platform: 'youtube'
      };
    }
    
    // Calculate average aspect ratio
    const avgAspectRatio = imageAnalysis.reduce((sum, img) => sum + img.aspectRatio, 0) / imageAnalysis.length;
    const mostCommonOrientation = imageAnalysis.reduce((acc, img) => {
      if (img.aspectRatio < 0.75) acc.portrait++;
      else if (img.aspectRatio > 1.33) acc.landscape++;
      else acc.square++;
      return acc;
    }, { portrait: 0, landscape: 0, square: 0 });
    
    console.log('Image analysis:', { avgAspectRatio, mostCommonOrientation });
    
    // Determine optimal format based on analysis
    if (mostCommonOrientation.portrait > mostCommonOrientation.landscape) {
      // Vertical/Portrait format - Instagram Reels, TikTok, YouTube Shorts
      return {
        width: 1080,
        height: 1920,
        aspectRatio: 9/16,
        format: 'portrait',
        platform: 'reels'
      };
    } else if (avgAspectRatio > 1.5) {
      // Wide landscape format - YouTube, professional presentations
      return {
        width: 1920,
        height: 1080,
        aspectRatio: 16/9,
        format: 'landscape',
        platform: 'youtube'
      };
    } else {
      // Square or near-square format - Instagram posts, universal format
      return {
        width: 1080,
        height: 1080,
        aspectRatio: 1/1,
        format: 'square',
        platform: 'instagram'
      };
    }
  } catch (error) {
    console.error('Error analyzing images:', error);
    // Fallback to standard landscape format
    return {
      width: 1920,
      height: 1080,
      aspectRatio: 16/9,
      format: 'landscape',
      platform: 'youtube'
    };
  }
}

/**
 * Gets dimensions of an image from URL
 * @param {string} url - Image URL
 * @returns {Promise<Object>} - Image dimensions
 */
function getImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Gets smart layout configuration based on video format
 * @param {Object} videoFormat - Video format configuration
 * @returns {Object} - Layout configuration
 */
function getSmartLayout(videoFormat) {
  const { width, height, format } = videoFormat;
  
  if (format === 'portrait') {
    // Portrait/Vertical format (9:16) - Instagram Reels, TikTok
    const logoWidth = Math.min(220, width * 0.25); // Much bigger logo
    const logoHeight = Math.min(110, width * 0.13);
    return {
      overlay: {
        position: { x: 0, y: height - 550 }, // Bottom overlay for property content
        width: width,
        height: 550
      },
      logo: {
        position: { x: (width - logoWidth) / 2, y: 25 }, // Centered horizontally at top
        width: logoWidth,
        height: logoHeight
      },
      text: {
        rightPosition: width - 30, // Right aligned with padding
        startY: height - 500, // Back to bottom for property content
        maxWidth: width - 60
      },
      contact: {
        position: { x: (width - 320) / 2, y: height/2 - 160 }, // ONLY contact scene centered!
        width: 320,
        height: 320
      }
    };
  } else if (format === 'landscape') {
    // Landscape format (16:9) - YouTube, wide screens
    const logoWidth = Math.min(260, width * 0.22); // Much bigger logo
    const logoHeight = Math.min(130, width * 0.11);
    return {
      overlay: {
        position: { x: width - 500, y: 0 }, // Side overlay for property content
        width: 500,
        height: height
      },
      logo: {
        position: { x: (width - logoWidth) / 2, y: 20 }, // Centered horizontally at top
        width: logoWidth,
        height: logoHeight
      },
      text: {
        rightPosition: width - 30, // Right aligned
        startY: 180, // Back to side positioning for property content
        maxWidth: 450 // Wider for bigger text
      },
      contact: {
        position: { x: (width - Math.min(400, width * 0.30)) / 2, y: height/2 - 200 }, // ONLY contact scene centered!
        width: Math.min(400, width * 0.30), // Much bigger profile image
        height: Math.min(400, width * 0.30)
      }
    };
  } else {
    // Square format (1:1) - Instagram posts
    const logoWidth = Math.min(180, width * 0.20); // Much bigger logo
    const logoHeight = Math.min(95, width * 0.11);
    return {
      overlay: {
        position: { x: width - 450, y: 0 }, // Side overlay for property content
        width: 450,
        height: height
      },
      logo: {
        position: { x: (width - logoWidth) / 2, y: 20 }, // Centered horizontally at top
        width: logoWidth,
        height: logoHeight
      },
      text: {
        rightPosition: width - 30, // Right aligned
        startY: 150, // Back to side positioning for property content
        maxWidth: width - 60
      },
      contact: {
        position: { x: (width - Math.min(350, width * 0.32)) / 2, y: height/2 - 175 }, // ONLY contact scene centered!
        width: Math.min(350, width * 0.32), // Much bigger profile image
        height: Math.min(350, width * 0.32)
      }
    };
  }
}

/**
 * Creates a video configuration from real estate listing data
 * @param {Object} listingData - The real estate listing data
 * @param {Array<string>} imageUrls - The image URLs to use in the video
 * @param {Object} videoFormat - The optimal video format configuration
 * @returns {Object} - The video configuration
 */
function createVideoConfigFromListing(listingData, imageUrls, videoFormat) {
  const { listing, agentName, phone, agencyName, languageChoice } = listingData;
  
  // Create a scene for each image - ensure fixed duration for each image
  const scenes = [];
  
  // Make sure all images are used - set fixed duration for each image
  const fixedDuration = 5; // Each image shown for exactly 5 seconds
  
  // Ensure we have at least one image
  if (imageUrls.length === 0) {
    console.warn('No images found for video creation, using placeholder');
    imageUrls.push('https://via.placeholder.com/800x600?text=No+Image+Available');
  }
  
  // Get unique animations for all our scenes to avoid duplicates
  const totalScenes = imageUrls.length + 1; // +1 for the contact scene
  const animations = getUniqueAnimations(totalScenes);
  
  // Property type translations - only Hebrew
  const propertyTypeHebrew = getHebrewPropertyType(listing.type);
  
  // Logo URL
  const logoUrl = 'https://res.cloudinary.com/shhady/image/upload/v1743682079/no-bg-golden-removebg-preview_l3tbtr.png';
  
  // Smart positioning based on video format
  const layoutConfig = getSmartLayout(videoFormat);
  console.log('Using layout configuration:', layoutConfig);
  
  // Function to create text elements for a scene with smart positioning
  const createSceneTextElements = () => {
    const textElements = [
      {
        type: 'text',
        text: listing.title,
        position: { x: layoutConfig.text.rightPosition, y: layoutConfig.text.startY },
        color: 'white',
        fontSize: Math.max(32, Math.min(44, videoFormat.width * 0.040)), // Much bigger title
        fontWeight: 'bold',
        textAlign: 'right',
        direction: 'rtl',
        maxWidth: layoutConfig.text.maxWidth
      },
      {
        type: 'text',
        text: `${propertyTypeHebrew} - ${listing.location}`,
        position: { x: layoutConfig.text.rightPosition, y: layoutConfig.text.startY + 60 },
        color: 'white',
        fontSize: Math.max(24, Math.min(32, videoFormat.width * 0.030)), // Much bigger subtitle
        textAlign: 'right',
        direction: 'rtl',
        maxWidth: layoutConfig.text.maxWidth
      }
    ];
    
    // Reset dynamic Y position for each scene
    let dynamicYPosition = layoutConfig.text.startY + 130;
    
    // Add rooms field only if data exists
    if (listing.rooms) {
      textElements.push({
        type: 'text',
        text: `${listing.rooms} חדרים`,
        position: { x: layoutConfig.text.rightPosition, y: dynamicYPosition },
        color: 'white',
        fontSize: Math.max(26, Math.min(34, videoFormat.width * 0.032)), // Much bigger font
        fontWeight: 'bold',
        textAlign: 'right',
        direction: 'rtl',
        maxWidth: layoutConfig.text.maxWidth
      });
      dynamicYPosition += Math.max(50, videoFormat.height * 0.055); // More spacing for bigger text
    }
    
    // Add area field only if data exists
    if (listing.area) {
      textElements.push({
        type: 'text',
        text: `${listing.area} מ"ר`,
        position: { x: layoutConfig.text.rightPosition, y: dynamicYPosition },
        color: 'white',
        fontSize: Math.max(26, Math.min(34, videoFormat.width * 0.032)), // Much bigger font
        fontWeight: 'bold',
        textAlign: 'right',
        direction: 'rtl',
        maxWidth: layoutConfig.text.maxWidth
      });
      dynamicYPosition += Math.max(50, videoFormat.height * 0.055);
    }
    
    // Add floor field only if data exists
    if (listing.floor) {
      textElements.push({
        type: 'text',
        text: `קומה ${listing.floor}`,
        position: { x: layoutConfig.text.rightPosition, y: dynamicYPosition },
        color: 'white',
        fontSize: Math.max(26, Math.min(34, videoFormat.width * 0.032)), // Much bigger font
        fontWeight: 'bold',
        textAlign: 'right',
        direction: 'rtl',
        maxWidth: layoutConfig.text.maxWidth
      });
      dynamicYPosition += Math.max(50, videoFormat.height * 0.055);
    }
    
    // Add price (always show)
    textElements.push({
      type: 'text',
      text: `מחיר: ₪${Number(listing.price).toLocaleString()}`,
      position: { x: layoutConfig.text.rightPosition, y: dynamicYPosition },
      color: '#FFD700', // Gold color for price
      fontSize: Math.max(30, Math.min(40, videoFormat.width * 0.038)), // Much bigger price
      fontWeight: 'bold',
      textAlign: 'right',
      direction: 'rtl',
      maxWidth: layoutConfig.text.maxWidth
    });
    
    return textElements;
  };
  
  // Create an intro scene
  scenes.push({
    duration: fixedDuration,
    elements: [
      {
        type: 'image',
        url: imageUrls[0],
        position: { x: 0, y: 0 },
        animation: animations[0]
      },
      {
        type: 'overlay',
        color: 'rgba(0, 0, 0, 0.6)',
        position: layoutConfig.overlay.position,
        width: layoutConfig.overlay.width,
        height: layoutConfig.overlay.height
      },
      {
        type: 'image',
        url: logoUrl,
        position: layoutConfig.logo.position,
        width: layoutConfig.logo.width,
        height: layoutConfig.logo.height
      },
      ...createSceneTextElements()
    ]
  });
  
  // Create a scene for each additional image
  for (let i = 1; i < imageUrls.length; i++) {
    scenes.push({
      duration: fixedDuration,
      elements: [
        {
          type: 'image',
          url: imageUrls[i],
          position: { x: 0, y: 0 },
          animation: animations[i]
        },
        {
          type: 'overlay',
          color: 'rgba(0, 0, 0, 0.6)',
          position: layoutConfig.overlay.position,
          width: layoutConfig.overlay.width,
          height: layoutConfig.overlay.height
        },
        {
          type: 'image',
          url: logoUrl,
          position: layoutConfig.logo.position,
          width: layoutConfig.logo.width,
          height: layoutConfig.logo.height
        },
        ...createSceneTextElements()
      ]
    });
  }
  
  // Add contact info scene
  scenes.push({
    duration: fixedDuration,
    elements: [
      // Background is a solid color instead of an image with animation
      {
        type: 'overlay',
        color: '#000000', // Black background for the entire frame
        position: { x: 0, y: 0 },
        width: videoFormat.width,
        height: videoFormat.height
      },
      // Add subtle gradient for visual interest
      {
        type: 'gradient',
        startColor: 'rgba(0, 0, 30, 0.7)',
        endColor: 'rgba(30, 0, 60, 0.2)',
        position: { x: 0, y: 0 },
        width: videoFormat.width,
        height: videoFormat.height,
        direction: 'to-right'
      },
      // Add contact image with smart positioning - use user's profile image
      {
        type: 'image',
        url: listingData.userProfileImage || 'https://res.cloudinary.com/shhady/image/upload/v1744933003/Screenshot_2025-04-18_023553_la0lo3.jpg', // Use user's profile image or fallback to default
        position: layoutConfig.contact.position,
        width: layoutConfig.contact.width,
        height: layoutConfig.contact.height,
        isContactImage: true
      },
      // Contact scene overlay - centered around the contact content
      {
        type: 'overlay',
        color: 'rgba(0, 0, 0, 0.6)',
        position: { x: 0, y: videoFormat.height/2 - 275 },
        width: videoFormat.width,
        height: 550
      },
      {
        type: 'image',
        url: logoUrl,
        position: layoutConfig.logo.position,
        width: layoutConfig.logo.width,
        height: layoutConfig.logo.height
      },
      // Contact text positioning based on format
      ...(videoFormat.format === 'portrait' ? [
        // Portrait: Content below image
        {
          type: 'text',
          text: 'לפרטים',
          position: { 
            x: layoutConfig.contact.position.x + layoutConfig.contact.width / 2, 
            y: layoutConfig.contact.position.y + layoutConfig.contact.height + 20 
          },
          color: 'white',
          fontSize: Math.max(36, Math.min(48, videoFormat.width * 0.042)), // Much bigger
          fontWeight: 'bold',
          textAlign: 'center',
          direction: 'rtl',
          maxWidth: layoutConfig.contact.width
        },
        {
          type: 'text',
          text: `${agentName}`,
          position: { 
            x: layoutConfig.contact.position.x + layoutConfig.contact.width / 2, 
            y: layoutConfig.contact.position.y + layoutConfig.contact.height + 70 
          },
          color: 'white',
          fontSize: Math.max(30, Math.min(38, videoFormat.width * 0.035)), // Much bigger
          fontWeight: 'bold',
          textAlign: 'center',
          direction: 'rtl',
          maxWidth: layoutConfig.contact.width
        },
        {
          type: 'text',
          text: `${phone}`,
          position: { 
            x: layoutConfig.contact.position.x + layoutConfig.contact.width / 2, 
            y: layoutConfig.contact.position.y + layoutConfig.contact.height + 120 
          },
          color: '#FFD700',
          fontSize: Math.max(28, Math.min(36, videoFormat.width * 0.033)), // Much bigger
          fontWeight: 'bold',
          textAlign: 'center',
          direction: 'ltr',
          maxWidth: layoutConfig.contact.width
        },
        {
          type: 'text',
          text: `${agencyName}`,
          position: { 
            x: layoutConfig.contact.position.x + layoutConfig.contact.width / 2, 
            y: layoutConfig.contact.position.y + layoutConfig.contact.height + 170 
          },
          color: '#FFD700',
          fontSize: Math.max(26, Math.min(34, videoFormat.width * 0.031)), // Much bigger
          fontWeight: 'bold',
          textAlign: 'center',
          direction: 'rtl',
          maxWidth: layoutConfig.contact.width
        }
      ] : [
        // Landscape & Square: Content below centered image
        {
          type: 'text',
          text: 'לפרטים נוספים',
          position: { 
            x: layoutConfig.contact.position.x + layoutConfig.contact.width / 2, 
            y: layoutConfig.contact.position.y + layoutConfig.contact.height + 30 
          },
          color: 'white',
          fontSize: Math.max(40, Math.min(52, videoFormat.width * 0.045)), // Much bigger
          fontWeight: 'bold',
          textAlign: 'center',
          direction: 'rtl',
          maxWidth: layoutConfig.contact.width
        },
        {
          type: 'text',
          text: `${agentName}`,
          position: { 
            x: layoutConfig.contact.position.x + layoutConfig.contact.width / 2, 
            y: layoutConfig.contact.position.y + layoutConfig.contact.height + 90 
          },
          color: 'white',
          fontSize: Math.max(34, Math.min(44, videoFormat.width * 0.040)), // Much bigger
          fontWeight: 'bold',
          textAlign: 'center',
          direction: 'rtl',
          maxWidth: layoutConfig.contact.width
        },
        {
          type: 'text',
          text: `${phone}`,
          position: { 
            x: layoutConfig.contact.position.x + layoutConfig.contact.width / 2, 
            y: layoutConfig.contact.position.y + layoutConfig.contact.height + 150 
          },
          color: '#FFD700',
          fontSize: Math.max(32, Math.min(42, videoFormat.width * 0.038)), // Much bigger
          fontWeight: 'bold',
          textAlign: 'center',
          direction: 'ltr',
          maxWidth: layoutConfig.contact.width
        },
        {
          type: 'text',
          text: `${agencyName}`,
          position: { 
            x: layoutConfig.contact.position.x + layoutConfig.contact.width / 2, 
            y: layoutConfig.contact.position.y + layoutConfig.contact.height + 210 
          },
          color: '#FFD700',
          fontSize: Math.max(30, Math.min(40, videoFormat.width * 0.036)), // Much bigger
          fontWeight: 'bold',
          textAlign: 'center',
          direction: 'rtl',
          maxWidth: layoutConfig.contact.width
        }
      ])
    ]
  });
  
  // Calculate total duration based on fixed scene durations
  const totalDuration = scenes.length * fixedDuration;
  
  return {
    duration: totalDuration,
    scenes
  };
}

// Function to get Hebrew property type
function getHebrewPropertyType(type) {
  const typeMap = {
    'apartment': 'דירה',
    'house': 'בית',
    'villa': 'וילה',
    'penthouse': 'פנטהאוז',
    'office': 'משרד',
    'store': 'חנות',
    'land': 'קרקע',
    'warehouse': 'מחסן'
  };
  
  return typeMap[type] || type;
}

// Function to get Arabic property type
function getArabicPropertyType(type) {
  const typeMap = {
    'apartment': 'شقة',
    'house': 'منزل',
    'villa': 'فيلا',
    'penthouse': 'بنتهاوس',
    'office': 'مكتب',
    'store': 'متجر',
    'land': 'أرض',
    'warehouse': 'مستودع'
  };
  
  return typeMap[type] || type;
}

/**
 * Returns a random modern animation type
 * @returns {string} - Random modern animation type
 */
function getRandomAnimation() {
  const modernAnimations = [
    'smoothZoomIn',
    'smoothZoomOut', 
    'cinematicPan',
    'parallaxZoom',
    'smoothSlide',
    'modernKenBurns',
    'elegantFade',
    'dynamicPush',
    'floatingZoom',
    'cinematicReveal'
  ];
  return modernAnimations[Math.floor(Math.random() * modernAnimations.length)];
}

/**
 * Helper function to calculate proper image scaling and positioning to maintain aspect ratio
 * @param {HTMLImageElement} img - The image element
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {string} fit - 'cover' (fill area, crop if needed) or 'contain' (fit entirely, letterbox if needed)
 * @returns {Object} - Scaling and positioning information
 */
function calculateImageFit(img, canvasWidth, canvasHeight, fit = 'cover') {
  const imgAspectRatio = img.naturalWidth / img.naturalHeight;
  const canvasAspectRatio = canvasWidth / canvasHeight;
  
  let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
  
  if (fit === 'cover') {
    // Fill the entire canvas, crop if necessary
    if (imgAspectRatio > canvasAspectRatio) {
      // Image is wider than canvas - fit to height and crop width
      drawHeight = canvasHeight;
      drawWidth = drawHeight * imgAspectRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
    } else {
      // Image is taller than canvas - fit to width and crop height
      drawWidth = canvasWidth;
      drawHeight = drawWidth / imgAspectRatio;
      offsetY = (canvasHeight - drawHeight) / 2;
    }
  } else {
    // 'contain' - fit entire image, add letterboxing if necessary
    if (imgAspectRatio > canvasAspectRatio) {
      // Image is wider - fit to width
      drawWidth = canvasWidth;
      drawHeight = drawWidth / imgAspectRatio;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      // Image is taller - fit to height
      drawHeight = canvasHeight;
      drawWidth = drawHeight * imgAspectRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
    }
  }
  
  return { drawWidth, drawHeight, offsetX, offsetY };
}

/**
 * Smooth easing functions for modern animations
 */
const easing = {
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
};

/**
 * Enhanced function for drawing images with modern animations and proper aspect ratio
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLImageElement} img - Image to draw
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {Object} animation - Animation configuration
 * @param {number} progress - Animation progress (0-1)
 */
function drawImageWithAspectRatio(ctx, img, canvasWidth, canvasHeight, animation, progress = 1) {
  // Calculate base dimensions maintaining aspect ratio
  const { drawWidth, drawHeight, offsetX, offsetY } = calculateImageFit(img, canvasWidth, canvasHeight, 'cover');
  
  // Apply modern animations with smooth easing
  ctx.save();
  
  if (animation === 'smoothZoomIn') {
    const easedProgress = easing.easeOutCubic(progress);
    const scale = 0.7 + (easedProgress * 0.3); // Smoother zoom range
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    ctx.globalAlpha = easedProgress; // Fade in while zooming
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.drawImage(img, offsetX - centerX, offsetY - centerY, drawWidth, drawHeight);
  } 
  else if (animation === 'smoothZoomOut') {
    const easedProgress = easing.easeInOutCubic(progress);
    const scale = 1.3 - (easedProgress * 0.3);
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.drawImage(img, offsetX - centerX, offsetY - centerY, drawWidth, drawHeight);
  }
  else if (animation === 'cinematicPan') {
    const easedProgress = easing.easeInOutQuart(progress);
    const extraScale = 1.15;
    const extraWidth = drawWidth * extraScale;
    const extraHeight = drawHeight * extraScale;
    const extraOffsetX = (canvasWidth - extraWidth) / 2;
    const extraOffsetY = (canvasHeight - extraHeight) / 2;
    
    // Cinematic left-to-right pan with subtle zoom
    const panOffset = (easedProgress - 0.5) * canvasWidth * 0.15;
    const zoomScale = 1 + (Math.sin(easedProgress * Math.PI) * 0.05); // Subtle zoom pulse
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(zoomScale, zoomScale);
    ctx.drawImage(img, extraOffsetX - centerX + panOffset, extraOffsetY - centerY, extraWidth, extraHeight);
  }
  else if (animation === 'parallaxZoom') {
    const easedProgress = easing.easeOutBack(Math.min(progress, 1));
    const scale = 0.8 + (easedProgress * 0.4); // Dramatic zoom with overshoot
    const parallaxX = (1 - easedProgress) * canvasWidth * 0.1 * Math.sin(progress * Math.PI);
    const parallaxY = (1 - easedProgress) * canvasHeight * 0.05;
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    ctx.translate(centerX + parallaxX, centerY + parallaxY);
    ctx.scale(scale, scale);
    ctx.drawImage(img, offsetX - centerX, offsetY - centerY, drawWidth, drawHeight);
  }
  else if (animation === 'smoothSlide') {
    const easedProgress = easing.easeOutQuart(progress);
    const slideX = (1 - easedProgress) * canvasWidth * 0.3;
    const slideY = (1 - easedProgress) * canvasHeight * 0.1;
    const fadeAlpha = easedProgress;
    
    ctx.globalAlpha = fadeAlpha;
    ctx.drawImage(img, offsetX + slideX, offsetY + slideY, drawWidth, drawHeight);
  }
  else if (animation === 'modernKenBurns') {
    const easedProgress = easing.easeInOutCubic(progress);
    const scale = 1.2 - (easedProgress * 0.2);
    
    // Modern Ken Burns with curved path
    const panX = Math.sin(easedProgress * Math.PI * 0.5) * canvasWidth * 0.08;
    const panY = Math.cos(easedProgress * Math.PI * 0.3) * canvasHeight * 0.04;
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.drawImage(img, offsetX - centerX + panX, offsetY - centerY + panY, drawWidth, drawHeight);
  }
  else if (animation === 'elegantFade') {
    const easedProgress = easing.easeOutCubic(progress);
    const scale = 0.95 + (easedProgress * 0.05); // Subtle scale with fade
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    ctx.globalAlpha = easedProgress;
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.drawImage(img, offsetX - centerX, offsetY - centerY, drawWidth, drawHeight);
  }
  else if (animation === 'dynamicPush') {
    const easedProgress = easing.easeOutBack(Math.min(progress, 1));
    const pushY = (1 - easedProgress) * canvasHeight * 0.4;
    const scale = 0.7 + (easedProgress * 0.3);
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.drawImage(img, offsetX - centerX, offsetY - centerY + pushY, drawWidth, drawHeight);
  }
  else if (animation === 'floatingZoom') {
    const easedProgress = easing.easeInOutCubic(progress);
    const scale = 0.9 + (easedProgress * 0.1);
    
    // Floating motion with sine wave
    const floatY = Math.sin(easedProgress * Math.PI * 2) * canvasHeight * 0.02;
    const rotateAngle = Math.sin(easedProgress * Math.PI) * 0.01; // Very subtle rotation
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    ctx.translate(centerX, centerY + floatY);
    ctx.rotate(rotateAngle);
    ctx.scale(scale, scale);
    ctx.drawImage(img, offsetX - centerX, offsetY - centerY, drawWidth, drawHeight);
  }
  else if (animation === 'cinematicReveal') {
    const easedProgress = easing.easeOutQuart(progress);
    
    // Create a cinematic wipe effect
    const revealWidth = drawWidth * easedProgress;
    const revealHeight = drawHeight;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(offsetX, offsetY, revealWidth, revealHeight);
    ctx.clip();
    
    // Slightly zoom in during reveal
    const scale = 1.1 - (easedProgress * 0.1);
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.drawImage(img, offsetX - centerX, offsetY - centerY, drawWidth, drawHeight);
    ctx.restore();
  }
  else {
    // Default: static image with proper aspect ratio
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }
  
  ctx.restore();
}

/**
 * Mock function for creating a video from configuration
 * In real implementation, this would be imported from directRenderer
 * @param {Object} config - Video configuration
 * @param {number} width - Video width
 * @param {number} height - Video height
 * @param {number} fps - Frames per second
 * @returns {Promise<Blob>} - Video blob
 */
async function createVideoFromConfig(config, width = 800, height = 600, fps = 30) {
  console.log('Creating video from config with HTML canvas');
  console.log('Config:', JSON.stringify(config));
  
  try {
    // Create a canvas element to render our video frames
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Enable high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Load all images first to prevent rendering delays
    const imageCache = {};
    const imageLoadPromises = [];
    
    // Extract all unique image URLs from all scenes
    const imageUrls = new Set();
    config.scenes.forEach(scene => {
      scene.elements.forEach(element => {
        if (element.type === 'image' && element.url) {
          imageUrls.add(element.url);
        }
      });
    });
    
    // Preload all images
    for (const url of imageUrls) {
      const loadPromise = new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Allow cross-origin images
        img.onload = () => {
          imageCache[url] = img;
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${url}`);
          // Create a professional placeholder instead of failing
          const placeholderCanvas = document.createElement('canvas');
          placeholderCanvas.width = width;
          placeholderCanvas.height = height;
          const placeholderCtx = placeholderCanvas.getContext('2d');
          
          // Create gradient background for placeholder
          const gradient = placeholderCtx.createLinearGradient(0, 0, width, height);
          gradient.addColorStop(0, '#2c3e50');
          gradient.addColorStop(1, '#34495e');
          placeholderCtx.fillStyle = gradient;
          placeholderCtx.fillRect(0, 0, width, height);
          
          // Add subtle pattern
          placeholderCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          placeholderCtx.lineWidth = 1;
          for (let i = 0; i < width; i += 50) {
            placeholderCtx.beginPath();
            placeholderCtx.moveTo(i, 0);
            placeholderCtx.lineTo(i, height);
            placeholderCtx.stroke();
          }
          for (let i = 0; i < height; i += 50) {
            placeholderCtx.beginPath();
            placeholderCtx.moveTo(0, i);
            placeholderCtx.lineTo(width, i);
            placeholderCtx.stroke();
          }
          
          // Add professional text with responsive sizing
          placeholderCtx.fillStyle = '#ecf0f1';
          const fontSize = Math.max(16, Math.min(32, width * 0.04));
          const smallFontSize = Math.max(12, Math.min(20, width * 0.025));
          placeholderCtx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`;
          placeholderCtx.textAlign = 'center';
          placeholderCtx.textBaseline = 'middle';
          placeholderCtx.fillText('תמונה לא זמינה', width/2, height/2 - fontSize/2);
          placeholderCtx.font = `${smallFontSize}px Arial, Helvetica, sans-serif`;
          placeholderCtx.fillText('Image Not Available', width/2, height/2 + fontSize/2);
          
          // Convert to image and cache
          const placeholderImg = new Image();
          placeholderImg.src = placeholderCanvas.toDataURL();
          placeholderImg.onload = () => {
            imageCache[url] = placeholderImg;
            resolve();
          };
        };
        img.src = url;
      });
      imageLoadPromises.push(loadPromise);
    }
    
    // Wait for all images to load
    await Promise.all(imageLoadPromises);
    console.log('All images loaded successfully');
    
    // Create a MediaRecorder to capture the canvas frames with enhanced quality
    const stream = canvas.captureStream(fps);
    
    // Try different codecs for best quality, fallback if not supported
    let mimeType = 'video/webm;codecs=vp9';
    let videoBitsPerSecond = 8000000; // Increased bitrate for better quality
    
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond
    });
    
    console.log(`Recording with: ${mimeType} at ${videoBitsPerSecond} bps`);
    
    const recordedChunks = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    
    // Create a promise that resolves when recording is stopped
    const recordingPromise = new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        resolve(blob);
      };
    });
    
    // Start recording
    mediaRecorder.start();
    
    // Calculate total frames based on duration and fps
    const totalFrames = Math.ceil(config.duration * fps);
    let currentFrame = 0;
    
    // Render each frame
    let currentSceneIndex = 0;
    let sceneStartFrame = 0;
    let currentScene = config.scenes[currentSceneIndex];
    let sceneDurationInFrames = Math.ceil(currentScene.duration * fps);
    
    // Function to render one frame
    const renderFrame = () => {
      // Clear canvas with a professional gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1a1a1a');   // Dark gray at top
      gradient.addColorStop(0.5, '#000000'); // Black in middle  
      gradient.addColorStop(1, '#1a1a1a');   // Dark gray at bottom
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Calculate which scene we're in
      if (currentFrame >= sceneStartFrame + sceneDurationInFrames) {
        // Move to next scene
        currentSceneIndex++;
        if (currentSceneIndex >= config.scenes.length) {
          // We've rendered all scenes, stop
          mediaRecorder.stop();
          return;
        }
        
        sceneStartFrame = currentFrame;
        currentScene = config.scenes[currentSceneIndex];
        sceneDurationInFrames = Math.ceil(currentScene.duration * fps);
      }
      
      // Calculate progress within this scene (0-1)
      const sceneProgress = (currentFrame - sceneStartFrame) / sceneDurationInFrames;
      
      // Render all elements in the current scene
      for (const element of currentScene.elements) {
        if (element.type === 'image' && element.url && imageCache[element.url]) {
          const img = imageCache[element.url];
          
          // If this is a logo or element with specific width/height
          if (element.width && element.height) {
            const x = element.position?.x || 0;
            const y = element.position?.y || 0;
            
            // Add subtle modern animation to logo in portrait mode
            if (element.url.includes('no-bg-golden') && width < height) { // Portrait mode logo
              ctx.save();
              
              // Gentle floating animation
              const floatY = Math.sin(currentFrame * 0.05) * 3; // Slow gentle float
              const scale = 1 + (Math.sin(currentFrame * 0.03) * 0.02); // Subtle breathing effect
              const glow = 0.3 + (Math.sin(currentFrame * 0.04) * 0.1); // Soft glow pulse
              
              // Add glow effect
              ctx.shadowColor = 'rgba(255, 215, 0, ' + glow + ')';
              ctx.shadowBlur = 15;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              
              // Apply transformations
              const centerX = x + element.width / 2;
              const centerY = y + element.height / 2;
              ctx.translate(centerX, centerY + floatY);
              ctx.scale(scale, scale);
              
              // Draw logo with effects
              ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
              
              ctx.restore();
              
              // Reset shadow for other elements
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
            } else {
              // Draw normal logo without animation
              ctx.drawImage(img, x, y, element.width, element.height);
            }
          }
          // If this is marked as a contact image, handle it specially with perfect aspect ratio preservation
          else if (element.isContactImage) {
            const containerX = element.position?.x || 0;
            const containerY = element.position?.y || 0;
            const maxWidth = element.width || 300;
            const maxHeight = element.height || 300;
            
            // Calculate the best fit that maintains aspect ratio
            const imgAspectRatio = img.naturalWidth / img.naturalHeight;
            const containerAspectRatio = maxWidth / maxHeight;
            
            let drawWidth, drawHeight;
            
            if (imgAspectRatio > containerAspectRatio) {
              // Image is wider than container - fit to width
              drawWidth = maxWidth;
              drawHeight = maxWidth / imgAspectRatio;
            } else {
              // Image is taller than container - fit to height  
              drawHeight = maxHeight;
              drawWidth = maxHeight * imgAspectRatio;
            }
            
            // Center the image within the container
            const offsetX = (maxWidth - drawWidth) / 2;
            const offsetY = (maxHeight - drawHeight) / 2;
            
            // Add professional styling for profile image
            ctx.save();
            
            // Create rounded corners effect by clipping
            const cornerRadius = 12;
            const finalX = containerX + offsetX;
            const finalY = containerY + offsetY;
            
            // Draw elegant blurred shadow effect
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            
            // Draw a temporary shape to create the shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(finalX, finalY, drawWidth, drawHeight, cornerRadius);
            } else {
              ctx.moveTo(finalX + cornerRadius, finalY);
              ctx.arcTo(finalX + drawWidth, finalY, finalX + drawWidth, finalY + drawHeight, cornerRadius);
              ctx.arcTo(finalX + drawWidth, finalY + drawHeight, finalX, finalY + drawHeight, cornerRadius);
              ctx.arcTo(finalX, finalY + drawHeight, finalX, finalY, cornerRadius);
              ctx.arcTo(finalX, finalY, finalX + drawWidth, finalY, cornerRadius);
              ctx.closePath();
            }
            ctx.fill();
            
            // Reset shadow for the actual image
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            
            // Create rounded rectangle clipping path (with fallback for older browsers)
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(finalX, finalY, drawWidth, drawHeight, cornerRadius);
            } else {
              // Fallback for browsers without roundRect support
              ctx.moveTo(finalX + cornerRadius, finalY);
              ctx.arcTo(finalX + drawWidth, finalY, finalX + drawWidth, finalY + drawHeight, cornerRadius);
              ctx.arcTo(finalX + drawWidth, finalY + drawHeight, finalX, finalY + drawHeight, cornerRadius);
              ctx.arcTo(finalX, finalY + drawHeight, finalX, finalY, cornerRadius);
              ctx.arcTo(finalX, finalY, finalX + drawWidth, finalY, cornerRadius);
              ctx.closePath();
            }
            ctx.clip();
            
            // Draw the actual image with perfect aspect ratio
            ctx.drawImage(img, finalX, finalY, drawWidth, drawHeight);
            
            // Reset clipping
            ctx.restore();
            ctx.save();
            
            // Add elegant golden border
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(finalX, finalY, drawWidth, drawHeight, cornerRadius);
            } else {
              ctx.moveTo(finalX + cornerRadius, finalY);
              ctx.arcTo(finalX + drawWidth, finalY, finalX + drawWidth, finalY + drawHeight, cornerRadius);
              ctx.arcTo(finalX + drawWidth, finalY + drawHeight, finalX, finalY + drawHeight, cornerRadius);
              ctx.arcTo(finalX, finalY + drawHeight, finalX, finalY, cornerRadius);
              ctx.arcTo(finalX, finalY, finalX + drawWidth, finalY, cornerRadius);
              ctx.closePath();
            }
            ctx.stroke();
            
            // Add subtle inner glow
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(finalX + 2, finalY + 2, drawWidth - 4, drawHeight - 4, cornerRadius - 2);
            } else {
              const innerRadius = cornerRadius - 2;
              ctx.moveTo(finalX + 2 + innerRadius, finalY + 2);
              ctx.arcTo(finalX + drawWidth - 2, finalY + 2, finalX + drawWidth - 2, finalY + drawHeight - 2, innerRadius);
              ctx.arcTo(finalX + drawWidth - 2, finalY + drawHeight - 2, finalX + 2, finalY + drawHeight - 2, innerRadius);
              ctx.arcTo(finalX + 2, finalY + drawHeight - 2, finalX + 2, finalY + 2, innerRadius);
              ctx.arcTo(finalX + 2, finalY + 2, finalX + drawWidth - 2, finalY + 2, innerRadius);
              ctx.closePath();
            }
            ctx.stroke();
            
            ctx.restore();
          }
          // Otherwise, it's a background image - use aspect-ratio-aware rendering
          else {
            // Use the new aspect-ratio-aware drawing function
            drawImageWithAspectRatio(ctx, img, width, height, element.animation, sceneProgress);
          }
        }
        else if (element.type === 'overlay' && element.color) {
          // Handle semi-transparent overlay (for the left side info panel)
          const x = element.position?.x || 0;
          const y = element.position?.y || 0;
          const overlayWidth = element.width || width / 3; // Default to 1/3 of the video width
          const overlayHeight = element.height || height;
          
          // Draw the overlay with the specified opacity
          ctx.fillStyle = element.color;
          ctx.fillRect(x, y, overlayWidth, overlayHeight);
        }
        else if (element.type === 'gradient' && element.startColor && element.endColor) {
          // Handle gradient overlay
          const x = element.position?.x || 0;
          const y = element.position?.y || 0;
          const gradientWidth = element.width || width;
          const gradientHeight = element.height || height;
          
          // Create gradient
          let gradient;
          if (element.direction === 'to-right') {
            gradient = ctx.createLinearGradient(x, y, x + gradientWidth, y);
          } else if (element.direction === 'to-bottom') {
            gradient = ctx.createLinearGradient(x, y, x, y + gradientHeight);
          } else if (element.direction === 'diagonal') {
            gradient = ctx.createLinearGradient(x, y, x + gradientWidth, y + gradientHeight);
          } else {
            gradient = ctx.createLinearGradient(x, y, x + gradientWidth, y); // Default to horizontal
          }
          
          // Add color stops
          gradient.addColorStop(0, element.startColor);
          gradient.addColorStop(1, element.endColor);
          
          // Apply gradient
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, gradientWidth, gradientHeight);
        }
        else if (element.type === 'text' && element.text) {
          // Enhanced text rendering with professional styling
          const fontSize = element.fontSize || 24;
          const fontWeight = element.fontWeight || 'normal';
          const fontFamily = element.fontFamily || 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
          const textColor = element.color || 'white';
          
          ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = textColor;
          ctx.textBaseline = 'top';
          
          // Enhanced shadow with multiple layers for depth
          ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
          
          // Get position and alignment
          const x = element.position?.x || 10;
          const y = element.position?.y || 10;
          const textAlign = element.textAlign || 'left';
          const direction = element.direction || 'ltr';
          
          // Set text alignment and direction
          ctx.textAlign = textAlign;
          
          // Text can be multiline, split by newlines
          const lines = element.text.split('\n');
          const lineHeight = fontSize + 6; // Increased line spacing for better readability
          
          // Add subtle background for better text visibility (optional)
          if (element.addBackground !== false) {
            ctx.save();
            const padding = 8;
            const textMetrics = ctx.measureText(element.text);
            const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
            const bgHeight = lines.length * lineHeight + padding * 2;
            
            let bgX = x - padding;
            if (textAlign === 'right') {
              bgX = x - maxWidth - padding;
            } else if (textAlign === 'center') {
              bgX = x - maxWidth/2 - padding;
            }
            
            // Semi-transparent background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(bgX, y - padding, maxWidth + padding * 2, bgHeight);
            ctx.restore();
          }
          
          // Render text with enhanced styling and word wrapping if maxWidth is specified
          if (element.maxWidth) {
            // Handle text wrapping for long text
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              const words = line.split(' ');
              let currentLine = '';
              let currentY = y + (i * lineHeight);
              
              for (let j = 0; j < words.length; j++) {
                const testLine = currentLine + words[j] + ' ';
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > element.maxWidth && currentLine !== '') {
                  // Line is too long, draw current line and start new one
                  ctx.fillText(currentLine.trim(), x, currentY);
                  currentLine = words[j] + ' ';
                  currentY += lineHeight;
                } else {
                  currentLine = testLine;
                }
              }
              // Draw the last line
              if (currentLine.trim() !== '') {
                ctx.fillText(currentLine.trim(), x, currentY);
              }
            }
          } else {
            // Regular text rendering without word wrapping
            if (direction === 'rtl') {
              for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], x, y + (i * lineHeight));
              }
            } else {
              for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], x, y + (i * lineHeight));
              }
            }
          }
          
          // Reset shadow and text alignment
          ctx.shadowColor = 'transparent';
          ctx.textAlign = 'left';
        }
      }
      
      // Move to next frame
      currentFrame++;
      
      // Render next frame or stop if done
      if (currentFrame < totalFrames) {
        requestAnimationFrame(renderFrame);
      } else {
        mediaRecorder.stop();
      }
    };
    
    // Start rendering frames
    renderFrame();
    
    // Wait for recording to finish
    const videoBlob = await recordingPromise;
    console.log('Video created successfully, size:', videoBlob.size);
    
    return videoBlob;
  } catch (error) {
    console.error('Error creating video:', error);
    throw new Error(`Failed to create video: ${error.message}`);
  }
}

/**
 * Mock function for uploading video to Cloudinary
 * In real implementation, this would be imported from videoUpload
 * @param {Blob} videoBlob - Video blob to upload
 * @returns {Promise<string>} - URL of uploaded video
 */
async function uploadToCloudinary(videoBlob) {
  try {
    console.log('Uploading video blob to Cloudinary, size:', (videoBlob.size / 1024 / 1024).toFixed(2), 'MB, type:', videoBlob.type);
    
    // Step 1: Get a signature from our backend
    const signatureResponse = await fetch('/api/cloudinary/signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        folder: 'video_uploads',
        fileType: 'video',
        format: 'mp4', // Include format in the signature request
      }),
    });
    
    if (!signatureResponse.ok) {
      throw new Error(`Failed to get upload signature: ${signatureResponse.status}`);
    }
    
    const { signature, timestamp, cloudName, apiKey, folder, resource_type } = await signatureResponse.json();
    
    console.log('Received signature for upload:', { 
      signatureStart: signature.substring(0, 6) + '...',
      timestamp,
      folder,
      resource_type,
      format: 'mp4'
    });
    
    // Step 2: Create form data for the upload
    const formData = new FormData();
    formData.append('file', videoBlob);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('resource_type', resource_type);
    formData.append('format', 'mp4'); // Request MP4 format conversion
    
    // Step 3: Upload directly to Cloudinary
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resource_type}/upload`, true);
      
      // Set up progress tracking
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          console.log(`Upload progress: ${percentComplete}%`);
        }
      };
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            console.log('Upload successful:', data.secure_url);
            console.log('Public ID:', data.public_id);
            // Return both URL and public_id for future deletion
            resolve({
              secure_url: data.secure_url,
              public_id: data.public_id
            });
          } catch (error) {
            console.error('Error parsing upload response:', error);
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          console.error('Upload failed:', xhr.status, xhr.responseText);
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };
      
      xhr.onerror = function() {
        console.error('Upload error');
        reject(new Error('Upload error'));
      };
      
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw error;
  }
}

// Function to get modern animations without repeating
function getUniqueAnimations(count) {
  const modernAnimationTypes = [
    'smoothZoomIn',
    'smoothZoomOut', 
    'cinematicPan',
    'parallaxZoom',
    'smoothSlide',
    'modernKenBurns',
    'elegantFade',
    'dynamicPush',
    'floatingZoom',
    'cinematicReveal'
  ];
  
  // Shuffle the array for variety
  const shuffled = [...modernAnimationTypes].sort(() => 0.5 - Math.random());
  
  // If we need more animations than available types, we'll have to repeat
  // but we'll try to maximize variety
  if (count <= modernAnimationTypes.length) {
    return shuffled.slice(0, count);
  } else {
    const result = [];
    while (result.length < count) {
      result.push(...shuffled.sort(() => 0.5 - Math.random()));
    }
    return result.slice(0, count);
  }
} 