import { NextResponse } from 'next/server';
import { getUser } from '@/app/lib/auth';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      userId: user.userId,
      role: user.role
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Error checking authentication' },
      { status: 500 }
    );
  }
} 