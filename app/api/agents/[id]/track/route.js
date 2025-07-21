import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import mongoose from 'mongoose';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    
    // Basic validation
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid agent ID' },
        { status: 400 }
      );
    }

    const { type } = await request.json();

    // Validate interaction type
    const validTypes = ['profile', 'whatsapp', 'email', 'phone', 'social'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid interaction type' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the agent
    const agent = await User.findById(id);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Initialize interactions if not exists
    if (!agent.interactions) {
      agent.interactions = {
        whatsapp: 0,
        email: 0,
        phone: 0,
        profileViews: 0
      };
    }

    // Update interactions based on type
    if (type === 'profile') {
      agent.interactions.profileViews += 1;
    } else {
      agent.interactions[type] += 1;
    }

    // Save without validation to avoid agencyName requirement errors
    await agent.save({ validateBeforeSave: false });

    // Return updated agent interactions
    return NextResponse.json({ 
      agent: {
        interactions: agent.interactions
      }
    });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}