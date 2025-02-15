import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the token cookie with proper settings
    cookies().delete('token', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    // Create response with proper headers
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_API_URL || '*');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Error during logout' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  const response = new NextResponse(null, {
    status: 200,
  });

  response.headers.set('Access-Control-Allow-Methods', 'POST');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_API_URL || '*');

  return response;
} 