// Utility function to fetch user's logo overlay public_id
export const getUserLogoOverlayId = async () => {
  try {
    const res = await fetch('/api/users/profile');
    if (!res.ok) {
      console.error('Failed to fetch user profile');
      return null;
    }
    
    const userData = await res.json();
    console.log('=== USER LOGO FOR OVERLAY ===');
    console.log('User logo data:', userData.logo);
    console.log('Overlay public_id:', userData.logo?.overlayPublicId);
    console.log('=============================');
    
    return userData.logo?.overlayPublicId || null;
  } catch (error) {
    console.error('Error fetching user logo for overlay:', error);
    return null;
  }
}; 