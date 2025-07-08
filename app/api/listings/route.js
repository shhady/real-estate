import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Fetch all listings from MongoDB, sort by most recent first
    const listings = await db.collection('listings')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100) // Limit to 100 most recent listings
      .toArray();
    
    // Return success with listings data
    return NextResponse.json({
      success: true,
      listings
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch listings',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 