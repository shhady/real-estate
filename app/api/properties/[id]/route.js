import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Property from '../../../models/Property';
import { getUser } from '../../../lib/auth';
import { deleteImage } from '../../../lib/cloudinary';


// GET single property
export async function GET(request, { params }) {
  const { id } = await params;
  
  try {
    await connectDB();
    const property = await Property.findById(id)
      .populate({
        path: 'user',
        model: 'User',
        select: 'fullName email phone whatsapp bio profileImage'
      });
    
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update property
export async function PUT(request, { params }) {
  const { id } = await params;
  
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.user.toString() !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Updating property with data:', data); // Debug log
    
    // Check if collaboration is being enabled (was false, now true)
    const wasCollaborationEnabled = Boolean(property.collaboration);
    const isCollaborationEnabled = Boolean(data.collaboration);
    const collaborationJustEnabled = !wasCollaborationEnabled && isCollaborationEnabled;
    
    // Clean undefined values from data and handle address properly
    const cleanData = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        // Handle address object specifically
        if (key === 'address' && data[key] && typeof data[key] === 'object') {
          cleanData[key] = {
            neighborhood: data[key].neighborhood || '',
            street: data[key].street || '',
            number: data[key].number || ''
          };
        } else {
          cleanData[key] = data[key];
        }
      }
    });

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      cleanData,
      { new: true, runValidators: true }
    ).populate({
      path: 'user',
      model: 'User',
      select: 'fullName email phone whatsapp bio profileImage'
    });

    // Note: Collaboration emails are now handled in the UI to allow users to select which agents to notify
    // This ensures emails are only sent when explicitly requested by the user

    return NextResponse.json(updatedProperty);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH update property (partial update)
export async function PATCH(request, { params }) {
  const { id } = await params;
  
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.user.toString() !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Updating property with partial data:', data); // Debug log
    
    // Clean undefined values from data
    const cleanData = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        cleanData[key] = data[key];
      }
    });

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      cleanData,
      { new: true, runValidators: true }
    ).populate({
      path: 'user',
      model: 'User',
      select: 'fullName email phone whatsapp bio profileImage'
    });

    return NextResponse.json(updatedProperty);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE property
export async function DELETE(request, { params }) {
  const { id } = await params;
  
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.user.toString() !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete images from Cloudinary
    for (const image of property.images) {
      if (image.publicId) {
        await deleteImage(image.publicId);
      }
    }

    await Property.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 