import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Property from '../../../models/Property';
import mongoose from 'mongoose';

// GET single agent
export async function GET(request, { params }) {
  const { id } = await params;

  try {
    await connectDB();

    const agent = await User.findById(id)
      .select('-password')
      .lean();

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const properties = await Property.find({ user: id })
      .select('title description price location images status bedrooms bathrooms area propertyType')
      .lean();

    // Convert ObjectIds to strings and combine data
    const sanitizedAgent = {
      ...agent,
      _id: agent._id.toString(),
      properties: properties.map(property => ({
        ...property,
        _id: property._id.toString(),
        user: property.user.toString()
      }))
    };

    return NextResponse.json(sanitizedAgent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update agent
export async function PUT(request, { params }) {
  const {id} = await params;
  try {
    await connectDB();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    const agent = await User.findById(id);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // If updating profile image, handle old image deletion in Cloudinary here if needed

    const updatedAgent = await User.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    ).select('-password');

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Error updating agent' },
      { status: 500 }
    );
  }
}

// DELETE agent
export async function DELETE(request, { params }) {
  const {id} = await params;
  try {
    await connectDB();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }
    
    const agent = await User.findById(id);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Delete profile image from Cloudinary if exists
    if (agent.profileImage?.publicId) {
      // Handle Cloudinary image deletion here
    }

    // Delete all properties associated with this agent
    await Property.deleteMany({ user: id });

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Error deleting agent' },
      { status: 500 }
    );
  }
} 