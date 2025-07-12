import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Property from '../../models/Property';
import { checkCollaborationMatches } from '../../services/checkCollaborationMatches.js';

export async function POST(request) {
  try {
    const { propertyId } = await request.json();
    
    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    await connectDB();
    
    // Get the property
    const property = await Property.findById(propertyId)
      .populate('user', 'fullName email phone')
      .lean();
    
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    console.log('🧪 Testing collaboration matching for property:', property.title);
    
    // Test the collaboration matching
    const result = await checkCollaborationMatches(property);
    
    return NextResponse.json({
      success: true,
      property: {
        id: property._id,
        title: property.title,
        location: property.location,
        collaboration: property.collaboration
      },
      result: result || { message: 'No matches found' }
    });
    
  } catch (error) {
    console.error('Error testing collaboration:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    
    // Get all properties with collaboration enabled
    const collaborationProperties = await Property.find({ collaboration: true })
      .populate('user', 'fullName email')
      .select('title location collaboration user')
      .lean();
    
    return NextResponse.json({
      success: true,
      message: 'Collaboration test endpoint',
      collaborationProperties: collaborationProperties.length,
      properties: collaborationProperties,
      instructions: {
        testEndpoint: 'POST /api/test-collaboration with { propertyId: "..." }',
        description: 'Use this endpoint to test collaboration matching for a specific property'
      }
    });
    
  } catch (error) {
    console.error('Error in collaboration test:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 