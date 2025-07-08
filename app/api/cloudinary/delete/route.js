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
    // Parse the request body
    const { publicId } = await request.json();
    
    // Validate that the required parameter is provided
    if (!publicId) {
      return NextResponse.json(
        { error: 'Missing publicId parameter' },
        { status: 400 }
      );
    }

    console.log('Attempting to delete resource from Cloudinary:', publicId);
    
    // Delete the resource from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video'
    });
    
    console.log('Cloudinary delete result:', result);
    
    // Check if the deletion was successful
    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        message: 'Video deleted successfully',
        result
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete video',
          result 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting video from Cloudinary:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete video',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 