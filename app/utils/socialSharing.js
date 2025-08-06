// Social Media Sharing Utility
export const shareToFacebook = (property) => {
  const {
    title,
    price,
    location,
    bedrooms,
    area,
    propertyType,
    status,
    images,
    video,
    descriptions
  } = property;

  // Create a compelling description for Facebook
  const description = descriptions?.hebrew || descriptions?.arabic || `נכס ${status === 'For Sale' ? 'למכירה' : 'להשכרה'}: ${title} ב${location}`;
  
  // Get the first image or video for sharing
  const mediaUrl = video?.secure_url || (images && images[0]?.secure_url);
  
  // Create the sharing URL with better formatting
  const shareUrl = encodeURIComponent(`${window.location.origin}/properties/${property._id}`);
  
  // Create a more engaging share text
  const shareText = encodeURIComponent(`🏠 ${title}

${description}

💰 מחיר: ₪${price.toLocaleString()}
🛏️ חדרים: ${bedrooms}
📐 שטח: ${area} מ"ר
📍 מיקום: ${location}
${status === 'For Sale' ? '🏷️ למכירה' : '🔑 להשכרה'}

לפרטים נוספים: ${window.location.origin}/properties/${property._id}`);
  
  // Facebook sharing URL
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
  
  // Open in new window
  window.open(facebookUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
};

// Enhanced Facebook sharing with image preview
export const shareToFacebookWithImage = (property) => {
  const {
    title,
    price,
    location,
    bedrooms,
    area,
    status,
    images,
    video
  } = property;

  // Create a temporary sharing page with Open Graph meta tags
  const shareData = {
    title: title,
    text: `🏠 ${title} - ${status === 'For Sale' ? 'למכירה' : 'להשכרה'} ב${location} - ₪${price.toLocaleString()}`,
    url: `${window.location.origin}/properties/${property._id}`,
  };

  // Try to use the Web Share API first (works better on mobile)
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    navigator.share(shareData).catch((error) => {
      console.log('Web Share API failed, falling back to URL sharing');
      shareToFacebook(property);
    });
  } else {
    // Fallback to URL sharing
    shareToFacebook(property);
  }
};

export const shareToInstagram = (property) => {
  const {
    title,
    price,
    location,
    bedrooms,
    area,
    status,
    images,
    video
  } = property;

  // Create Instagram-friendly content with emojis and formatting
  const description = `🏠 ${title}

${status === 'For Sale' ? '🏷️ למכירה' : '🔑 להשכרה'}
💰 מחיר: ₪${price.toLocaleString()}
🛏️ חדרים: ${bedrooms}
📐 שטח: ${area} מ"ר
📍 מיקום: ${location}

#נכסים #נדל״ן #${location.replace(/\s+/g, '')} #${status === 'For Sale' ? 'למכירה' : 'להשכרה'}

לפרטים נוספים: ${window.location.origin}/properties/${property._id}`;
  
  // Copy to clipboard
  navigator.clipboard.writeText(description).then(() => {
    alert('התוכן הועתק ללוח! כעת פתח את Instagram והדבק את התוכן. אם יש לך תמונות או וידאו, תוכל להוסיף אותם גם כן.');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = description;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('התוכן הועתק ללוח! כעת פתח את Instagram והדבק את התוכן. אם יש לך תמונות או וידאו, תוכל להוסיף אותם גם כן.');
  });
};

export const downloadMediaForSharing = async (property) => {
  const { images, video } = property;
  
  if (video?.secure_url) {
    // Download video
    const link = document.createElement('a');
    link.href = video.secure_url;
    link.download = `property-${property._id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (images && images.length > 0) {
    // Download first image
    const link = document.createElement('a');
    link.href = images[0].secure_url;
    link.download = `property-${property._id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Download all media for sharing
export const downloadAllMediaForSharing = async (property) => {
  const { images, video } = property;
  
  if (video?.secure_url) {
    // Download video
    const link = document.createElement('a');
    link.href = video.secure_url;
    link.download = `property-${property._id}-video.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  if (images && images.length > 0) {
    // Download all images
    images.forEach((image, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = image.secure_url;
        link.download = `property-${property._id}-image-${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500); // Delay each download by 500ms
    });
  }
};

export const getShareableContent = (property) => {
  const {
    title,
    price,
    location,
    bedrooms,
    area,
    status,
    descriptions
  } = property;

  const description = descriptions?.hebrew || descriptions?.arabic || `נכס ${status === 'For Sale' ? 'למכירה' : 'להשכרה'}: ${title} ב${location}`;
  
  return {
    title,
    description,
    price: price.toLocaleString(),
    location,
    bedrooms,
    area,
    status: status === 'For Sale' ? 'למכירה' : 'להשכרה',
    url: `${window.location.origin}/properties/${property._id}`,
    hasMedia: !!(property.images?.length > 0 || property.video?.secure_url),
    mediaCount: (property.images?.length || 0) + (property.video?.secure_url ? 1 : 0)
  };
}; 