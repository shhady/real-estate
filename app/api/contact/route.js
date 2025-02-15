import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, phone, subject, message } = data;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { error: 'כל השדות הם חובה' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'כתובת דואר אלקטרוני לא תקינה' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Send an email notification
    // 2. Store the message in your database
    // 3. Send an auto-reply to the user
    
    // For now, we'll just simulate a successful submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      message: 'ההודעה נשלחה בהצלחה'
    });
  } catch (error) {
    console.error('Error in contact form submission:', error);
    return NextResponse.json(
      { error: 'אירעה שגיאה בשליחת הטופס' },
      { status: 500 }
    );
  }
} 