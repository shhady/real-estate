import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'טוקן וסיסמה נדרשים' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'הסיסמה חייבת להכיל לפחות 6 תווים' },
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

    // Update password and clear reset token fields
    user.password = password; // Will be hashed by the pre-save middleware
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    
    await user.save();

    return NextResponse.json({
      message: 'הסיסמה עודכנה בהצלחה'
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'שגיאה באיפוס הסיסמה. אנא נסה שוב מאוחר יותר.' },
      { status: 500 }
    );
  }
}