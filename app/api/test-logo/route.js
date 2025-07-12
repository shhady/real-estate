import { NextResponse } from 'next/server';

export async function GET(request) {
  console.log('🧪 Test endpoint called successfully');
  return NextResponse.json({ message: 'Test endpoint working' });
}

export async function POST(request) {
  console.log('🧪 Test POST endpoint called successfully');
  return NextResponse.json({ message: 'Test POST endpoint working' });
} 