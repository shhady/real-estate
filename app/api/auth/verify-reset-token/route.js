import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'טוקן נדרש' },
        { status: 400 }
      );
    }

    await connectDB();

    // Hash the token to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'טוקן לא תקין או פג תוקף' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'טוקן תקין',
      valid: true
    });

  } catch (error) {
    console.error('Error verifying reset token:', error);
    return NextResponse.json(
      { error: 'שגיאה בבדיקת הטוקן' },
      { status: 500 }
    );
  }
}