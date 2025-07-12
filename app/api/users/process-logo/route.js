import { NextResponse } from 'next/server';
import { getUser } from '../../../lib/auth';
import { removeBg, uploadProcessedImage } from '../../../utils/backgroundRemoval';

export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the uploaded file from form data
    const formData = await request.formData();
    const file = formData.get('logo');
    
    if (!file) {
      console.log('❌ No logo file provided');
      return NextResponse.json(
        { error: 'No logo file provided' },
        { status: 400 }
      );
    }

    console.log('=== LOGO PROCESSING START ===');
    console.log('Original file:', file.name, 'Size:', file.size, 'Type:', file.type);
    console.log('User ID:', user.userId);
    
    // Check if Remove.bg API key is configured
    if (!process.env.REMOVEBG_API_KEY) {
      console.log('❌ REMOVEBG_API_KEY not configured');
      return NextResponse.json(
        { error: 'Background removal service not configured' },
        { status: 500 }
      );
    }
    
    // Convert file to buffer
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    console.log('📷 Image buffer created, size:', imageBuffer.length);
    
    // Remove background using remove.bg API
    console.log('🔄 Removing background...');
    const processedImageBuffer = await removeBg(imageBuffer);
    console.log('✅ Background removed successfully, processed size:', processedImageBuffer.length);
    
    // Upload processed image to Cloudinary
    console.log('🔄 Uploading to Cloudinary...');
    const cloudinaryData = await uploadProcessedImage(processedImageBuffer, file.name);
    console.log('✅ Uploaded to Cloudinary:', cloudinaryData.secure_url);
    
    console.log('=== LOGO PROCESSING COMPLETE ===');
    console.log('Final result:', {
      secure_url: cloudinaryData.secure_url,
      publicId: cloudinaryData.publicId,
      overlayPublicId: cloudinaryData.overlayPublicId
    });
    console.log('================================');

    return NextResponse.json(cloudinaryData);
  } catch (error) {
    console.error('❌ Error processing logo:', error);
    console.error('Error stack:', error.stack);
    
    // Return specific error messages
    if (error.message.includes('Remove.bg API key is not configured')) {
      return NextResponse.json(
        { error: 'Background removal service not configured. Please add REMOVEBG_API_KEY to environment variables.' },
        { status: 500 }
      );
    } else if (error.message.includes('Remove.bg API')) {
      return NextResponse.json(
        { error: 'خطأ في إزالة الخلفية. يرجى المحاولة مرة أخرى.' },
        { status: 500 }
      );
    } else if (error.message.includes('Cloudinary')) {
      return NextResponse.json(
        { error: 'خطأ في رفع الصورة. يرجى المحاولة مرة أخرى.' },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: 'خطأ في معالجة الصورة. يرجى المحاولة مرة أخرى.' },
        { status: 500 }
      );
    }
  }
} 