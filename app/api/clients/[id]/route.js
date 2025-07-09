import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Client from '../../../models/Client';
import Call from '../../../models/Call';
import { getUser } from '../../../lib/auth';

// GET - Fetch specific client by ID
export async function GET(request, { params }) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params;
    
    const client = await Client.findOne({ 
      _id: id,
      userId: user.userId 
    }).populate({
      path: 'calls',
      options: { sort: { createdAt: -1 } } // Sort calls by newest first
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

// PUT - Update client
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
    
    const client = await Client.findOne({
      _id: id,
      userId: user.userId
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if phone number is being changed and if it conflicts with existing client
    if (body.phoneNumber && body.phoneNumber !== client.phoneNumber) {
      const existingClient = await Client.findOne({
        userId: user.userId,
        phoneNumber: body.phoneNumber,
        _id: { $ne: id }
      });

      if (existingClient) {
        return NextResponse.json(
          { error: 'Client with this phone number already exists' }, 
          { status: 400 }
        );
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { ...body },
      { new: true }
    ).populate({
      path: 'calls',
      options: { sort: { createdAt: -1 } } // Sort calls by newest first
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

// DELETE - Delete client
export async function DELETE(request, { params }) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params;
    
    const client = await Client.findOne({
      _id: id,
      userId: user.userId
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Remove client reference from calls but don't delete the calls
    await Call.updateMany(
      { clientId: id },
      { $unset: { clientId: 1 } }
    );

    await Client.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
} 