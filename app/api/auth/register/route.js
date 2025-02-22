import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function POST(request) {
  try {
    await connectDB();
    const { 
      fullName,
      fullNameEnglish,
      email, 
      password, 
      phone, 
      bio, 
      profileImage,
      licenseNumber,
      activityArea,
      socialMedia 
    } = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: 'משתמש עם כתובת דואר אלקטרוני זו כבר קיים' },
        { status: 400 }
      );
    }

    // Create user with profile image if provided
    const user = await User.create({
      fullName,
      slug: fullNameEnglish.toLowerCase().replace(/\s+/g, ''), // Use English name for slug
      email,
      password,
      phone,
      whatsapp:phone,
      bio,
      licenseNumber,
      activityArea,
      role: 'agent',
      profileImage: profileImage ? {
        secure_url: profileImage.secure_url,
        publicId: profileImage.publicId
      } : undefined,
      socialMedia: {
        instagram: socialMedia?.instagram || '',
        facebook: socialMedia?.facebook || ''
      }
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'אירעה שגיאה בתהליך ההרשמה' },
      { status: 500 }
    );
  }
} 