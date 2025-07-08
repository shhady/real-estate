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
    // Example URL: https://res.cloudinary.com/cloud_name/video/upload/v1234567890/folder/public_id.mp4
    const urlObj = new URL(url);
    
    // Check if it's a Cloudinary URL
    if (!urlObj.hostname.includes('cloudinary.com')) {
      console.warn('Not a Cloudinary URL:', url);
      return null;
    }
    
    // Get the path segments
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    
    // The format should be: [resource_type, delivery_type, version, public_id+extension]
    // We need to validate that the resource type matches and then extract the public ID
    if (pathSegments.length < 4 || pathSegments[0] !== resourceType) {
      console.warn('Invalid Cloudinary URL format:', url);
      return null;
    }
    
    // Check if we have a version segment (typically v1234567890)
    const versionSegmentIndex = pathSegments.findIndex(segment => segment.startsWith('v'));
    
    if (versionSegmentIndex === -1 || versionSegmentIndex === pathSegments.length - 1) {
      console.warn('Cannot find version segment in URL:', url);
      return null;
    }
    
    // Everything after the version segment is the public ID, need to join with '/'
    // We also need to remove the file extension
    const publicIdWithExt = pathSegments.slice(versionSegmentIndex + 1).join('/');
    
    // Remove extension
    const lastDotIndex = publicIdWithExt.lastIndexOf('.');
    const publicId = lastDotIndex !== -1 
      ? publicIdWithExt.substring(0, lastDotIndex) 
      : publicIdWithExt;
    
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