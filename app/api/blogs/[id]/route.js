import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Blog from '../../../models/Blog';
import { getUser } from '../../../lib/auth';
import { deleteImage } from '../../../lib/cloudinary';

// GET single blog
export async function GET(request, { params }) {
  const { id } = await params;
  
  try {
    await connectDB();
    
    // Try to find by ID first, then by slug if ID not found
    let blog = await Blog.findById(id)
      .populate('author', 'fullName email profileImage')
      .lean();

    if (!blog) {
      blog = await Blog.findOne({ slug: id })
        .lean();
    }

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Increment views
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT update blog
export async function PUT(request, { params }) {
  const { id } = await params;
  
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Check if user is author or admin
    if (blog.author.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If updating cover image, delete old one from Cloudinary
    if (data.coverImage && blog.coverImage?.publicId) {
      await deleteImage(blog.coverImage.publicId);
    }

    // Update slug if title changed
    if (data.title && data.title !== blog.title) {
      data.slug = encodeURIComponent(data.title.trim());
      
      // Check if new slug already exists
      const existingBlog = await Blog.findOne({ 
        slug: data.slug,
        _id: { $ne: id } // exclude current blog
      });
      
      if (existingBlog) {
        return NextResponse.json(
          { error: 'כותרת זו כבר קיימת במערכת' },
          { status: 400 }
        );
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    ).populate('author', 'fullName email profileImage');

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE blog
export async function DELETE(request, { params }) {
  const { id } = await params;
  
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Check if user is author or admin
    if (blog.author.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete cover image from Cloudinary if exists
    if (blog.coverImage?.publicId) {
      await deleteImage(blog.coverImage.publicId);
    }

    await Blog.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Blog deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 