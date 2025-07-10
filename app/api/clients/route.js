import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Client from '../../models/Client';
import { getUser } from '../../lib/auth';

// GET - Fetch all clients for the authenticated user
export async function GET(request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const intent = searchParams.get('intent');
    const priority = searchParams.get('priority');

    await connectDB();

    // Build query
    let query = { userId: user.userId };

    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (intent) query.intent = intent;
    if (priority) query.priority = priority;

    console.log('Fetching clients with query:', query);

    try {
      // Try with populate first
      const clients = await Client.find(query)
        .populate({
          path: 'calls',
          select: 'date summary',
          options: { 
            sort: { date: -1 },
            limit: 50  // Limit populated calls to avoid memory issues
          }
        })
        .sort({ updatedAt: -1 })
        .limit(100)
        .lean(); // Use lean for better performance

      console.log(`Successfully fetched ${clients.length} clients`);
      return NextResponse.json(clients);
    } catch (populateError) {
      console.warn('Populate failed, falling back to basic query:', populateError.message);
      
      // Fallback: fetch without populate if there's an issue
      const clients = await Client.find(query)
        .sort({ updatedAt: -1 })
        .limit(100)
        .lean();

      console.log(`Fallback: Successfully fetched ${clients.length} clients without populate`);
      return NextResponse.json(clients);
    }
  } catch (error) {
    console.error('Error fetching clients:', error);
    console.error('Error stack:', error.stack);
    
    // Return more specific error information in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = isDevelopment ? error.message : 'Failed to fetch clients';
    
    return NextResponse.json({ 
      error: errorMessage,
      ...(isDevelopment && { stack: error.stack })
    }, { status: 500 });
  }
}

// POST - Create new client
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
      email,
      intent,
      preferredLocation,
      preferredPropertyType,
      minRooms,
      maxRooms,
      minArea,
      maxArea,
      minPrice,
      maxPrice,
      preferredCondition,
      needsParking,
      needsBalcony,
      notes,
      status,
      priority,
      preferredContact,
      transcription,
      lastCallSummary,
      lastCallDate,
      tags,
      source
    } = body;

    await connectDB();

    // Check if client with same phone number already exists for this user
    const existingClient = await Client.findOne({
      userId: user.userId,
      phoneNumber: phoneNumber
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'Client with this phone number already exists' }, 
        { status: 400 }
      );
    }

    const newClient = await Client.create({
      userId: user.userId,
      clientName,
      phoneNumber,
      email: email || undefined,
      intent: intent || 'unknown',
      preferredLocation: preferredLocation || undefined,
      preferredPropertyType: preferredPropertyType || undefined,
      minRooms: minRooms || undefined,
      maxRooms: maxRooms || undefined,
      minArea: minArea || undefined,
      maxArea: maxArea || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      preferredCondition: preferredCondition || undefined,
      needsParking,
      needsBalcony,
      notes: notes || undefined,
      status: status || 'prospect',
      priority: priority || 'medium',
      preferredContact: preferredContact || 'phone',
      transcription: transcription || undefined,
      lastCallSummary: lastCallSummary || undefined,
      lastCallDate: lastCallDate || undefined,
      tags: tags || [],
      source: source || 'other'
    });

    return NextResponse.json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
} 