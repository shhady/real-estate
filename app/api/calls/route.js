import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Call from '../../models/Call';
import { getUser } from '../../lib/auth';

// GET - Fetch user's calls
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const calls = await Call.find({ userId: user.userId })
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(calls);
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 });
  }
}

// POST - Save new call analysis
export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      clientName, 
      phoneNumber, 
      transcription, 
      summary, 
      followUps, 
      positives, 
      issues,
      audioFileName,
      audioDuration
    } = body;

    await connectDB();

    const newCall = await Call.create({
      userId: user.userId,
      clientName,
      phoneNumber,
      transcription,
      summary,
      followUps: followUps || [],
      positives: positives || [],
      issues: issues || [],
      audioFileName,
      audioDuration
    });

    return NextResponse.json(newCall);
  } catch (error) {
    console.error('Error saving call:', error);
    return NextResponse.json({ error: 'Failed to save call' }, { status: 500 });
  }
} 