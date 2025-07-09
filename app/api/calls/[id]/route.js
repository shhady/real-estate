import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Call from '../../../models/Call';
import { getUser } from '../../../lib/auth';

// GET - Fetch specific call by ID
export async function GET(request, { params }) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params;
    
    const call = await Call.findOne({ 
      _id: id,
      userId: user.userId 
    }).lean();

    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    return NextResponse.json(call);
  } catch (error) {
    console.error('Error fetching call:', error);
    return NextResponse.json({ error: 'Failed to fetch call' }, { status: 500 });
  }
} 