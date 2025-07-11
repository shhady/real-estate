/**
 * Helper functions for Cloudinary operations
 */

/**
 * Extracts the public ID from a Cloudinary URL
 * 
 * @param {string} url - The Cloudinary URL
 * @param {string} resourceType - The resource type (image, video, etc.)
 * @returns {string|null} - The public ID or null if not found
 */
export function extractPublicIdFromUrl(url, resourceType = 'video') {
  if (!url) return null;
  
  try {
    console.log('Extracting public ID from URL:', url);
    const urlObj = new URL(url);
    
    // Check if it's a Cloudinary URL
    if (!urlObj.hostname.includes('cloudinary.com')) {
      console.warn('Not a Cloudinary URL:', url);
      return null;
    }
    
    // Get the path segments
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    console.log('Path segments:', pathSegments);
    
    // Find the resource type and upload type indices
    let resourceTypeIndex = -1;
    let uploadIndex = -1;
    
    for (let i = 0; i < pathSegments.length; i++) {
      if (pathSegments[i] === resourceType) {
        resourceTypeIndex = i;
      }
      if (pathSegments[i] === 'upload') {
        uploadIndex = i;
        break;
      }
    }
    
    if (resourceTypeIndex === -1 || uploadIndex === -1) {
      console.warn('Could not find resource type or upload in URL:', url);
      return null;
    }
    
    // Look for version segment after upload
    let publicIdStartIndex = uploadIndex + 1;
    
    // Check if there's a version segment (starts with 'v' followed by numbers)
    if (publicIdStartIndex < pathSegments.length && 
        pathSegments[publicIdStartIndex].match(/^v\d+$/)) {
      // Skip the version segment
      publicIdStartIndex++;
    }
    
    // Check if we have any segments left for the public ID
    if (publicIdStartIndex >= pathSegments.length) {
      console.warn('No public ID segments found in URL:', url);
      return null;
    }
    
    // Everything from publicIdStartIndex onwards is the public ID
    const publicIdWithExt = pathSegments.slice(publicIdStartIndex).join('/');
    
    // Remove extension if present
    const lastDotIndex = publicIdWithExt.lastIndexOf('.');
    const publicId = lastDotIndex !== -1 
      ? publicIdWithExt.substring(0, lastDotIndex) 
      : publicIdWithExt;
    
    console.log('Extracted public ID:', publicId);
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
}

/**
 * Deletes a resource from Cloudinary
 * 
 * @param {string} url - The Cloudinary URL
 * @param {string} resourceType - The resource type (image, video, etc.)
 * @returns {Promise<Object>} - The result of the delete operation
 */
export async function deleteCloudinaryResource(url, resourceType = 'video') {
  try {
    const publicId = extractPublicIdFromUrl(url, resourceType);
    
    if (!publicId) {
      throw new Error('Could not extract public ID from URL');
    }
    
    // Call the API endpoint to delete the resource
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to delete resource: ${errorData.error || response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting Cloudinary resource:', error);
    throw error;
  }
} 