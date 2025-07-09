import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export async function POST(request) {
  try {
    await connectDB();
    const { 
      fullName,
      fullNameEnglish,
      email, 
      password, 
      phone, 
      agencyName,
      agencyLogo,
      bio, 
      profileImage,
      licenseNumber,
      activityArea,
      socialMedia 
    } = await request.json();

    console.log('=== REGISTRATION API - AGENCY LOGO DATA ===');
    console.log('agencyLogo received:', agencyLogo);
    console.log('==========================================');

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
      agencyName,
      bio,
      licenseNumber,
      activityArea,
      role: 'agent',
      profileImage: profileImage ? {
        secure_url: profileImage.secure_url,
        publicId: profileImage.publicId
      } : undefined,
      logo: agencyLogo ? {
        secure_url: agencyLogo.secure_url,
        publicId: agencyLogo.publicId,
        overlayPublicId: agencyLogo.overlayPublicId
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