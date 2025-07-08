import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    console.log('Cloudinary config:', {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key_defined: !!process.env.CLOUDINARY_API_KEY,
      api_secret_defined: !!process.env.CLOUDINARY_API_SECRET,
    });

    const { folder, fileType, transformation, format } = await request.json();
    
    // Validate that the required parameters are provided
    if (!folder) {
      return NextResponse.json(
        { error: 'Missing folder parameter' },
        { status: 400 }
      );
    }

    // Get the current timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Prepare params for signing - exactly what will be sent to Cloudinary
    const params = {
      timestamp: timestamp,
      folder: folder,
    };

    // Add transformation if provided
    if (transformation) {
      params.transformation = transformation;
      console.log('Including transformation in signature:', transformation);
    }
    
    // Add format parameter if provided
    if (format) {
      params.format = format;
      console.log('Including format in signature:', format);
    }

    // Add file type indication
    if (fileType === 'image' || fileType === 'video') {
      // We don't add resource_type to params as it's part of the URL and not the form data
      // But we'll pass it back to the client for constructing the URL
      console.log(`Using resource_type: ${fileType}`);
    }

    // Generate the signature
    // Note: we don't include resource_type in the signature params because
    // it's part of the URL path, not form data
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    );

    console.log('Generated signature for upload', {
      timestamp,
      folder,
      format: format || 'none',
      signature: signature.substring(0, 6) + '...',
      params: JSON.stringify(params)
    });

    // Return the necessary data for client-side upload
    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      resource_type: fileType || 'auto',
      format: format || null,
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    );
  }
} 