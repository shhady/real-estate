import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Call from '../../models/Call';
import Client from '../../models/Client';
import { getUser } from '../../lib/auth';

// GET - Fetch all calls for the authenticated user
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const calls = await Call.find({ userId: user.userId })
      .populate('clientId', 'clientName phoneNumber') // Populate client information
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(calls);
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 });
  }
}

// POST - Save new call analysis with enhanced property data
// NOTE: This route is now mainly for backward compatibility
// New calls are saved directly in /api/call-analysis
export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      transcription, 
      summary, 
      followUps, 
      positives, 
      issues,
      intent,
      location,
      propertyType,
      rooms,
      area,
      price,
      condition,
      floor,
      parking,
      balcony,
      propertyNotes,
      audioFileUrl,
      cloudinaryUrl,
      clientId
    } = body;

    await connectDB();

    const newCall = await Call.create({
      userId: user.userId,
      clientId: clientId || null,
      audioFileUrl: audioFileUrl || cloudinaryUrl || 'N/A', // Make compatible with new schema
      transcription,
      summary,
      followUps: followUps || [],
      positives: positives || [],
      issues: issues || [],
      intent: intent || 'unknown',
      location: location || '',
      rooms: rooms || null,
      area: area || null,
      price: price || null,
      condition: condition || '',
      floor: floor || null,
      parking: parking,
      balcony: balcony,
      propertyNotes: propertyNotes || ''
    });

    return NextResponse.json(newCall);
  } catch (error) {
    console.error('Error saving call:', error);
    return NextResponse.json({ error: 'Failed to save call' }, { status: 500 });
  }
} 