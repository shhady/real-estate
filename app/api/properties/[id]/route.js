import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Property from '@/app/models/Property';
import { getUser } from '@/app/lib/auth';
import { deleteImage } from '@/app/lib/cloudinary';

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

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
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