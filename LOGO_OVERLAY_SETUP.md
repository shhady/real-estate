# Logo Overlay Setup Documentation

## What was implemented:

### 1. User Model Updates
- Added `overlayPublicId` field to the `logo` object in User schema
- This stores the Cloudinary public_id in overlay format (e.g., `l_public_id_here`)

### 2. Upload Process Updates
- **Sign-up page**: Added console.log to see Cloudinary response, generates overlayPublicId
- **Profile page**: Added console.log to see Cloudinary response, generates overlayPublicId
- **Registration API**: Added logging and saves overlayPublicId to database
- **Profile Update API**: Added logging to debug data flow

### 3. Utility Function
- Created `app/utils/userLogo.js` with `getUserLogoOverlayId()` function
- This function fetches the user's logo overlay public_id for use in MediaUploader

### 4. MediaUploader Preparation
- Added TODO comment showing where hardcoded logo will be replaced

## How the overlayPublicId is generated:
```javascript
const overlayPublicId = logoResponse.public_id ? 
  `l_${logoResponse.public_id.replace(/[\/\-\.]/g, '_')}` : null;
```

## Testing Steps:
1. Register a new user with a logo - check console for Cloudinary response
2. Update logo in profile page - check console for Cloudinary response
3. Verify overlayPublicId is saved in database
4. Use getUserLogoOverlayId() to fetch the overlay ID

## Next Steps:
1. Test the upload process and verify console logs
2. Update MediaUploader to use getUserLogoOverlayId() instead of hardcoded value
3. Replace `l_no-bg-golden-removebg-preview_l3tbtr` with dynamic user logo

## Console Logs to Watch:
- "=== CLOUDINARY LOGO UPLOAD RESPONSE ===" (Sign-up)
- "=== CLOUDINARY LOGO UPLOAD RESPONSE (Profile) ===" (Profile update)
- "=== REGISTRATION API - AGENCY LOGO DATA ===" (Registration API)
- "=== PROFILE UPDATE API - LOGO DATA ===" (Profile API)
- "=== USER LOGO FOR OVERLAY ===" (When fetching for overlay use) 