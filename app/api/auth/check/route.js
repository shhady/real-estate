import { NextResponse } from 'next/server';
import { getUser } from '../../../lib/auth';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return new NextResponse(
        JSON.stringify({ authenticated: false }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        authenticated: true,
        userId: user.userId,
        role: user.role
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );
  } catch (error) {
    console.error('Auth check error:', error);
    return new NextResponse(
      JSON.stringify({ authenticated: false, error: 'Error checking authentication' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );
  }
} 