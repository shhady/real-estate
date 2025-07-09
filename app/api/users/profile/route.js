import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { getUser } from '../../../lib/auth';

// GET user profile
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const userProfile = await User.findById(user.userId)
      .select('-password')
      .lean();

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE user profile
export async function PUT(request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    console.log('=== PROFILE UPDATE API - LOGO DATA ===');
    console.log('logo data received:', data.logo);
    console.log('======================================');
    
    await connectDB();

    // Ensure socialMedia object is properly structured
    const updateData = {
      ...data,
      socialMedia: {
        instagram: data.socialMedia?.instagram || '',
        facebook: data.socialMedia?.facebook || ''
      }
    };

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 