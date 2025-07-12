import { NextResponse } from 'next/server';
import { removeBg, uploadProcessedImage } from '../../utils/backgroundRemoval';

export async function POST(request) {
  try {
    console.log('🚀 /api/process-logo endpoint called');
    
    // Get the uploaded file from form data
    const formData = await request.formData();
    const file = formData.get('logo');
    
    console.log('📁 Form data keys:', Array.from(formData.keys()));
    console.log('📁 File received:', file ? 'Yes' : 'No');
    
    if (!file) {
      console.log('❌ No file provided');
      return NextResponse.json(
        { error: 'No logo file provided' },
        { status: 400 }
      );
    }

    console.log('=== SIGNUP LOGO PROCESSING START ===');
    console.log('Original file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Check if Remove.bg API key is configured
    console.log('🔑 Checking Remove.bg API key...');
    if (!process.env.REMOVEBG_API_KEY) {
      console.log('❌ Remove.bg API key not configured');
      return NextResponse.json(
        { error: 'Background removal service not configured' },
        { status: 500 }
      );
    }
    console.log('✅ Remove.bg API key found');
    
    // Convert file to buffer
    console.log('📷 Converting file to buffer...');
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    console.log('✅ Buffer created, size:', imageBuffer.length);
    
    // Remove background using remove.bg API
    console.log('🔄 Removing background...');
    const processedImageBuffer = await removeBg(imageBuffer);
    console.log('✅ Background removed successfully, processed size:', processedImageBuffer.length);
    
    // Upload processed image to Cloudinary
    console.log('🔄 Uploading to Cloudinary...');
    const cloudinaryData = await uploadProcessedImage(processedImageBuffer, file.name);
    console.log('✅ Uploaded to Cloudinary:', cloudinaryData.secure_url);
    
    console.log('=== SIGNUP LOGO PROCESSING COMPLETE ===');
    console.log('📋 Final result:', cloudinaryData);

    return NextResponse.json(cloudinaryData);
  } catch (error) {
    console.error('❌ Error processing signup logo:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error name:', error.name);
    
    return NextResponse.json(
      { error: error.message || 'Error processing logo' },
      { status: 500 }
    );
  }
} 