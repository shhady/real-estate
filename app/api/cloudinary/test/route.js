import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test signature generation to make sure it works
function testSignature() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Test a simple signature
    const simpleParams = { timestamp, folder: 'test' };
    const simpleSignature = cloudinary.utils.api_sign_request(
      simpleParams,
      process.env.CLOUDINARY_API_SECRET
    );
    
    // Test with transformation included
    const withTransformParams = { 
      timestamp, 
      folder: 'test',
      transformation: 'l_no-bg-golden-removebg-preview_l3tbtr,g_south_west,x_20,y_20,w_400'  
    };
    const withTransformSignature = cloudinary.utils.api_sign_request(
      withTransformParams,
      process.env.CLOUDINARY_API_SECRET
    );
    
    return {
      success: true,
      simpleSignature: simpleSignature.substring(0, 6) + '...',
      withTransformSignature: withTransformSignature.substring(0, 6) + '...',
      simpleParams,
      withTransformParams
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

export async function GET() {
  try {
    // Verify the credentials by using a simple API call
    const result = await cloudinary.api.ping();
    
    // Check if the logo resource exists
    let logoStatus = null;
    try {
      const logoResult = await cloudinary.api.resource('no-bg-golden-removebg-preview_l3tbtr');
      logoStatus = {
        exists: true,
        type: logoResult.resource_type,
        format: logoResult.format,
        public_id: logoResult.public_id,
        url: logoResult.secure_url
      };
    } catch (error) {
      logoStatus = {
        exists: false,
        error: error.message,
        error_details: error.error?.message || 'Unknown error'
      };
    }
    
    // Test signature generation
    const signatureTest = testSignature();
    
    return NextResponse.json({
      success: true,
      message: 'Cloudinary connection successful',
      credentials: {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKeyDefined: !!process.env.CLOUDINARY_API_KEY,
        apiSecretDefined: !!process.env.CLOUDINARY_API_SECRET
      },
      ping: result,
      logo: logoStatus,
      signatureTest
    });
  } catch (error) {
    console.error('Error testing Cloudinary connection:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        error_details: error.error?.message || 'Unknown error',
        credentials: {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          apiKeyDefined: !!process.env.CLOUDINARY_API_KEY,
          apiSecretDefined: !!process.env.CLOUDINARY_API_SECRET
        }
      },
      { status: 500 }
    );
  }
} 