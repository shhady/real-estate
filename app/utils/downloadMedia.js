/**
 * Downloads media from a URL
 * @param {string} url - URL of the media to download
 * @param {string} filename - Optional filename for the download
 */
export const downloadMedia = async (url, filename) => {
  try {
    // Extract filename from URL if not provided
    if (!filename) {
      filename = url.split('/').pop();
      // Clean up any query parameters
      filename = filename.split('?')[0];
    }
    
    // Determine if it's a video based on the URL or filename
    const isVideo = /\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i.test(url) || 
                    url.includes('/video/') ||
                    url.includes('/video_upload/');
                    
    // Add extension for video files if missing
    if (isVideo && !filename.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i)) {
      filename += '.mp4'; // Default to mp4 if no extension
    }
    
    // Force a direct fetch and blob download method for all browsers
    try {
      console.log('Starting direct download for:', url);
      
      // Fetch the resource
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the blob
      const blob = await response.blob();
      
      // Ensure proper MIME type for videos
      let properBlob = blob;
      if (isVideo) {
        let mimeType = 'video/mp4';
        if (filename.endsWith('.webm')) mimeType = 'video/webm';
        else if (filename.endsWith('.mov')) mimeType = 'video/quicktime';
        properBlob = new Blob([blob], { type: mimeType });
      }
      
      // Create a blob URL
      const blobUrl = URL.createObjectURL(properBlob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
      }, 300);
      
      console.log('Download completed for:', filename);
      return true;
    } catch (directError) {
      console.error('Direct download method failed:', directError);
      
      // Fall back to opening in a new tab
      alert('Download failed. We will open the file in a new tab - please right-click and select "Save As..."');
      window.open(url, '_blank');
      return false;
    }
  } catch (error) {
    console.error('Error downloading media:', error);
    alert('Failed to download media. Please try right-clicking and select "Save As".');
    
    // Fallback to opening in a new tab as last resort
    window.open(url, '_blank');
    return false;
  }
}; 