import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    if (!tokenCookie) return null;
    
    const token = tokenCookie.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    return {
      userId: payload.userId,
      role: payload.role
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
} 