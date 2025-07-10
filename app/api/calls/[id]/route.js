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

// PUT - Update call
export async function PUT(request, { params }) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params;
    
    const body = await request.json();
    
    const call = await Call.findOne({
      _id: id,
      userId: user.userId
    });

    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    // Update the call
    const updatedCall = await Call.findByIdAndUpdate(
      id,
      { ...body },
      { new: true }
    ).lean();

    // If preApproval is being updated and call has a linked client, update the client too
    if (body.preApproval !== undefined && call.clientId) {
      try {
        const Client = (await import('../../../models/Client')).default;
        await Client.findByIdAndUpdate(
          call.clientId,
          { preApproval: body.preApproval },
          { new: true }
        );
        console.log(`Updated client ${call.clientId} preApproval status to ${body.preApproval}`);
      } catch (clientUpdateError) {
        console.warn('Failed to update client preApproval:', clientUpdateError.message);
        // Don't fail the call update if client update fails
      }
    }

    return NextResponse.json(updatedCall);
  } catch (error) {
    console.error('Error updating call:', error);
    return NextResponse.json({ error: 'Failed to update call' }, { status: 500 });
  }
} 