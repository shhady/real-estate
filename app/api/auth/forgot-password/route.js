import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_FROM, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'כתובת אימייל נדרשת' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal that the email doesn't exist for security
      return NextResponse.json({
        message: 'אם האימייל קיים במערכת, נשלח קישור לאיפוס סיסמה'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token before saving to database
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiration (24 hours)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Email content
    const emailHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>איפוס סיסמה - KeysMatch</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            direction: rtl;
            text-align: right;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .title {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .reset-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            transition: background-color 0.3s;
          }
          .reset-button:hover {
            background-color: #1d4ed8;
          }
          .warning {
            background-color: #fef3cd;
            border: 1px solid #fceaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
          .link {
            word-break: break-all;
            color: #2563eb;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">KeysMatch</div>
            <h1 class="title">איפוס סיסמה</h1>
          </div>
          
          <div class="content">
            <p>שלום ${user.fullName},</p>
            
            <p>קיבלנו בקשה לאיפוס הסיסמה עבור החשבון שלך בKeysMatch.</p>
            
            <p>כדי לאפס את הסיסמה, לחץ על הכפתור הבא:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="reset-button">איפוס סיסמה</a>
            </div>
            
            <p>או העתק והדבק את הקישור הבא בדפדפן:</p>
            <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
            
            <div class="warning">
              <strong>⚠️ חשוב לדעת:</strong>
              <ul>
                <li>הקישור תקף למשך 24 שעות בלבד</li>
                <li>אם לא ביקשת איפוס סיסמה, אנא התעלם מהאימייל הזה</li>
                <li>הסיסמה שלך לא תשתנה עד שתשלים את התהליך</li>
              </ul>
            </div>
            
            <p>אם יש לך שאלות או זקוק לעזרה, אנא צור קשר עם צוות התמיכה שלנו.</p>
            
            <p>בברכה,<br>צוות KeysMatch</p>
          </div>
          
          <div class="footer">
            <p>אימייל זה נשלח באופן אוטומטי, אנא אל תשיב לו.</p>
            <p>© ${new Date().getFullYear()} KeysMatch. כל הזכויות שמורות.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: `"KeysMatch" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'איפוס סיסמה - KeysMatch',
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: 'אם האימייל קיים במערכת, נשלח קישור לאיפוס סיסמה'
    });

  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json(
      { error: 'שגיאה בשליחת האימייל. אנא נסה שוב מאוחר יותר.' },
      { status: 500 }
    );
  }
}