import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';

export async function GET(request, { params }) {
  try {
    const id = await params.id;
    
    // Validate the ID format
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid listing ID' 
        },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Find the listing by ID
    const listing = await db.collection('listings').findOne({ 
      _id: new ObjectId(id) 
    });
    
    if (!listing) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Listing not found' 
        },
        { status: 404 }
      );
    }
    
    // Return success with listing data
    return NextResponse.json({
      success: true,
      listing
    });
    
  } catch (error) {
    console.error('Error fetching listing by ID:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch listing',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 