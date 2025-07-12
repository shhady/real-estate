import { NextResponse } from 'next/server';

export async function removeBg(imageBuffer) {
  try {
    if (!process.env.REMOVEBG_API_KEY) {
      throw new Error('Remove.bg API key is not configured');
    }

    const formData = new FormData();
    formData.append("size", "auto");
    formData.append("image_file", new Blob([imageBuffer], { type: 'image/jpeg' }));

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { 
        "X-Api-Key": process.env.REMOVEBG_API_KEY 
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Remove.bg API error: ${response.status} - ${errorText}`);
    }

    const resultBuffer = await response.arrayBuffer();
    return Buffer.from(resultBuffer);
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
}

export async function uploadProcessedImage(processedImageBuffer, originalFileName) {
  try {
    // Convert buffer to base64 for Cloudinary upload (same as existing system)
    const base64Image = `data:image/png;base64,${processedImageBuffer.toString('base64')}`;
    
    const formData = new FormData();
    formData.append('file', base64Image);
    formData.append('upload_preset', 'real-estate');
    // Use the exact same approach as the existing system

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Cloudinary upload error: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    
    // Generate overlay public_id format exactly like the existing system
    const overlayPublicId = uploadResult.public_id ? 
      `l_${uploadResult.public_id.replace(/[\/\-\.]/g, '_')}` : null;

    return {
      secure_url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      overlayPublicId: overlayPublicId
    };
  } catch (error) {
    console.error('Error uploading processed image:', error);
    throw error;
  }
} 