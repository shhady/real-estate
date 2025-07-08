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
    
    // Extract images from mediaTypes
    const imageUrls = listingData.mediaTypes.filter(item => 
      typeof item === 'string' && (item.includes('.jpg') || item.includes('.png') || item.includes('.jpeg'))
    );
    
    if (imageUrls.length === 0) {
      throw new Error('No valid images found in the listing data');
    }
    
    // Create video configuration
    const videoConfig = createVideoConfigFromListing(listingData, imageUrls);
    
    // Generate video using direct renderer
    console.log('Creating video from config...');
    const videoBlob = await createVideoFromConfig(videoConfig, 800, 600, 30);
    
    // Upload to Cloudinary
    console.log('Uploading video to Cloudinary...');
    const videoUrl = await uploadToCloudinary(videoBlob);
    
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
      listingId: listingData.listing.title,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in video generation:', error);
    throw error;
  }
};

/**
 * Creates a video configuration from real estate listing data
 * @param {Object} listingData - The real estate listing data
 * @param {Array<string>} imageUrls - The image URLs to use in the video
 * @returns {Object} - The video configuration
 */
function createVideoConfigFromListing(listingData, imageUrls) {
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
  
  // RTL settings - place overlay on right side and text aligned right
  const overlayPosition = { x: 500, y: 0 }; // Move overlay to right side (800 - 300 = 500)
  const overlayWidth = 300;
  const textRightPosition = 750; // Right position for text (800 - 50 = 750)
  
  // Initialize y-position for text elements that will be positioned dynamically
  let dynamicYPosition = 230;
  
  // Function to create text elements for a scene with dynamic positioning
  const createSceneTextElements = () => {
    const textElements = [
      {
        type: 'text',
        text: listing.title,
        position: { x: textRightPosition, y: 120 },
        color: 'white',
        fontSize: 20,
        textAlign: 'right',
        direction: 'rtl'
      },
      {
        type: 'text',
        text: `${propertyTypeHebrew} - ${listing.location}`,
        position: { x: textRightPosition, y: 160 },
        color: 'white',
        fontSize: 16,
        textAlign: 'right',
        direction: 'rtl'
      }
    ];
    
    // Reset dynamic Y position for each scene
    dynamicYPosition = 230;
    
    // Add rooms field only if data exists
    if (listing.rooms) {
      textElements.push({
        type: 'text',
        text: `${listing.rooms} חדרים`,
        position: { x: textRightPosition, y: dynamicYPosition },
        color: 'white',
        fontSize: 16,
        textAlign: 'right',
        direction: 'rtl'
      });
      dynamicYPosition += 30; // Move down for next element
    }
    
    // Add area field only if data exists
    if (listing.area) {
      textElements.push({
        type: 'text',
        text: `${listing.area} מ"ר`,
        position: { x: textRightPosition, y: dynamicYPosition },
        color: 'white',
        fontSize: 16,
        textAlign: 'right',
        direction: 'rtl'
      });
      dynamicYPosition += 30; // Move down for next element
    }
    
    // Add floor field only if data exists
    if (listing.floor) {
      textElements.push({
        type: 'text',
        text: `קומה ${listing.floor}`,
        position: { x: textRightPosition, y: dynamicYPosition },
        color: 'white',
        fontSize: 16,
        textAlign: 'right',
        direction: 'rtl'
      });
      dynamicYPosition += 30; // Move down for next element
    }
    
    // Add price (always show)
    textElements.push({
      type: 'text',
      text: `מחיר: ₪${Number(listing.price).toLocaleString()}`,
      position: { x: textRightPosition, y: dynamicYPosition },
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'right',
      direction: 'rtl'
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
        color: 'rgba(0, 0, 0, 0.5)',
        position: overlayPosition,
        width: overlayWidth,
        height: 600
      },
      {
        type: 'image',
        url: logoUrl,
        position: { x: 630, y: 20 }, // Move logo to right side
        width: 150,
        height: 80
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
          color: 'rgba(0, 0, 0, 0.5)',
          position: overlayPosition,
          width: overlayWidth,
          height: 600
        },
        {
          type: 'image',
          url: logoUrl,
          position: { x: 630, y: 20 }, // Move logo to right side
          width: 150,
          height: 80
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
        width: 800,  // Use explicit width value
        height: 600  // Use explicit height value
      },
      // Add subtle gradient for visual interest
      {
        type: 'gradient',
        startColor: 'rgba(0, 0, 30, 0.7)',
        endColor: 'rgba(30, 0, 60, 0.2)',
        position: { x: 0, y: 0 },
        width: 800,
        height: 600,
        direction: 'to-right'
      },
      // Add fixed contact image on the left side
      {
        type: 'image',
        url: 'https://res.cloudinary.com/shhady/image/upload/v1744933003/Screenshot_2025-04-18_023553_la0lo3.jpg',
        position: { x: 20, y: 125 }, // Position on the left side with proper centering
        width: 450, // Make it larger to be more visible
        height: 350, // Keep aspect ratio appropriate
        isContactImage: true // Special flag to identify this image
      },
      {
        type: 'overlay',
        color: 'rgba(0, 0, 0, 0.5)',
        position: overlayPosition,
        width: overlayWidth,
        height: 600
      },
      {
        type: 'image',
        url: logoUrl,
        position: { x: 630, y: 20 }, // Move logo to right side
        width: 150,
        height: 80
      },
      {
        type: 'text',
        text: 'לפרטים נוספים',
        position: { x: textRightPosition, y: 170 }, // Adjusted position to align better with image
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'right',
        direction: 'rtl'
      },
      {
        type: 'text',
        text: `${agentName} | ${phone}`,
        position: { x: textRightPosition, y: 220 }, // Adjusted position
        color: 'white',
        fontSize: 22,
        textAlign: 'right',
        direction: 'rtl'
      },
      {
        type: 'text',
        text: `GoldenKey`,
        position: { x: textRightPosition, y: 270 }, // Add agency name
        color: 'gold',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'right',
        direction: 'rtl'
      }
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
 * Returns a random animation type
 * @returns {string} - Random animation type
 */
function getRandomAnimation() {
  const animations = [
    'panLeft', 
    'panRight', 
    'zoomIn', 
    'zoomOut', 
    'kenBurns', 
    'fadeIn',
    'slideUp',
    'slideDown'
  ];
  return animations[Math.floor(Math.random() * animations.length)];
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
          // Create a placeholder instead of failing
          const placeholderCanvas = document.createElement('canvas');
          placeholderCanvas.width = width;
          placeholderCanvas.height = height;
          const placeholderCtx = placeholderCanvas.getContext('2d');
          placeholderCtx.fillStyle = '#f0f0f0';
          placeholderCtx.fillRect(0, 0, width, height);
          placeholderCtx.fillStyle = '#999999';
          placeholderCtx.font = '20px Arial';
          placeholderCtx.textAlign = 'center';
          placeholderCtx.fillText('Image not available', width/2, height/2);
          
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
    
    // Create a MediaRecorder to capture the canvas frames
    const stream = canvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000
    });
    
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
      // Clear canvas
      ctx.fillStyle = '#000000';
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
            
            // Draw the image with the specified dimensions
            ctx.drawImage(img, x, y, element.width, element.height);
          }
          // Otherwise, it's a background image with animation
          else {
            // Check if this image has animations by checking if animation property exists
            if (!element.animation) {
              // No animation specified, just draw it normally at its position
              const x = element.position?.x || 0;
              const y = element.position?.y || 0;
              ctx.drawImage(img, x, y, width, height);
            }
            // Apply animations based on the element's animation type
            else if (element.animation === 'zoomIn') {
              // Adjust scale to ensure it ends at 1 (fully visible)
              // Starting from smaller (0.8) and ending at 1
              const scale = 0.8 + (sceneProgress * 0.2);
              const centerX = width / 2;
              const centerY = height / 2;
              ctx.save();
              ctx.translate(centerX, centerY);
              ctx.scale(scale, scale);
              ctx.drawImage(img, -centerX, -centerY, width, height);
              ctx.restore();
            } 
            else if (element.animation === 'zoomOut') {
              // Adjust scale to ensure it ends at 1 (fully visible)
              // Starting from larger (1.2) and ending at 1
              const scale = 1.2 - (sceneProgress * 0.2);
              const centerX = width / 2;
              const centerY = height / 2;
              ctx.save();
              ctx.translate(centerX, centerY);
              ctx.scale(scale, scale);
              ctx.drawImage(img, -centerX, -centerY, width, height);
              ctx.restore();
            }
            else if (element.animation === 'panLeft') {
              // Start with offset and end at 0 (centered)
              const offset = (1 - sceneProgress) * width * 0.2;
              ctx.drawImage(img, -offset, 0, width + offset, height);
            }
            else if (element.animation === 'panRight') {
              // Start with offset and end at 0 (centered)
              const offset = (1 - sceneProgress) * width * 0.2;
              ctx.drawImage(img, offset, 0, width + offset, height);
            }
            else if (element.animation === 'fadeIn') {
              // No change needed - already ends fully visible
              ctx.globalAlpha = sceneProgress;
              ctx.drawImage(img, 0, 0, width, height);
              ctx.globalAlpha = 1;
            }
            else if (element.animation === 'slideUp') {
              // Start below and end centered
              const offset = (1 - sceneProgress) * height * 0.2;
              ctx.drawImage(img, 0, offset, width, height);
            }
            else if (element.animation === 'slideDown') {
              // Start above and end centered
              const offset = (1 - sceneProgress) * height * 0.2;
              ctx.drawImage(img, 0, -offset, width, height);
            }
            else if (element.animation === 'kenBurns') {
              // Adjust ken burns to ensure it ends with scale 1 and no offset
              const scale = 1.1 - (sceneProgress * 0.1);
              const offsetX = (1 - sceneProgress) * width * 0.05;
              const centerX = width / 2;
              const centerY = height / 2;
              ctx.save();
              ctx.translate(centerX, centerY);
              ctx.scale(scale, scale);
              ctx.drawImage(img, -centerX - offsetX, -centerY, width, height);
              ctx.restore();
            }
            else {
              // Default: static image
              ctx.drawImage(img, 0, 0, width, height);
            }
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
          // Draw text with shadow for better visibility
          const fontSize = element.fontSize || 24;
          const fontWeight = element.fontWeight || 'normal';
          const fontFamily = element.fontFamily || 'Arial, Helvetica, sans-serif';
          const textColor = element.color || 'white';
          
          ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = textColor;
          ctx.textBaseline = 'top';
          
          // Add shadow for better visibility on any background
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 5;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          // Get position and alignment
          const x = element.position?.x || 10;
          const y = element.position?.y || 10;
          const textAlign = element.textAlign || 'left';
          const direction = element.direction || 'ltr';
          
          // Set text alignment and direction
          ctx.textAlign = textAlign;
          
          // Text can be multiline, split by newlines
          const lines = element.text.split('\n');
          
          // If RTL, we need special handling
          if (direction === 'rtl') {
            for (let i = 0; i < lines.length; i++) {
              // For RTL text aligned right, we draw at the specified x position
              ctx.fillText(lines[i], x, y + (i * (fontSize + 4)));
            }
          } else {
            for (let i = 0; i < lines.length; i++) {
              // For LTR text, we use the normal placement
              ctx.fillText(lines[i], x, y + (i * (fontSize + 4)));
            }
          }
          
          // Reset shadow and text alignment
          ctx.shadowColor = 'transparent';
          ctx.textAlign = 'left'; // Reset text alignment to default
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
            resolve(data.secure_url);
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

// Function to get animations without repeating
function getUniqueAnimations(count) {
  const animationTypes = [
    'panLeft', 
    'panRight', 
    'zoomIn', 
    'zoomOut', 
    'kenBurns', 
    'fadeIn',
    'slideUp',
    'slideDown'
  ];
  
  // Shuffle the array
  const shuffled = [...animationTypes].sort(() => 0.5 - Math.random());
  
  // If we need more animations than available types, we'll have to repeat
  // but we'll try to maximize variety
  if (count <= animationTypes.length) {
    return shuffled.slice(0, count);
  } else {
    const result = [];
    while (result.length < count) {
      result.push(...shuffled.sort(() => 0.5 - Math.random()));
    }
    return result.slice(0, count);
  }
} 