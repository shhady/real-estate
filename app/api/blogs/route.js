import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Blog from '@/app/models/Blog';
import { getUser } from '@/app/lib/auth';

// GET all blogs with filtering and pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    await connectDB();

    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const blogs = await Blog.find(query)
      .populate('author', 'fullName email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments(query);

    return NextResponse.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error in GET /api/blogs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST new blog
export async function POST(request) {
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
    
    // Create URL-friendly slug from title
    const slug = data.title.trim()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^\u0590-\u05FF\w-]/g, '') // Keep Hebrew chars and alphanumeric
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return NextResponse.json(
        { error: 'כותרת זו כבר קיימת במערכת' },
        { status: 400 }
      );
    }

    // Prepare the blog data
    const blogData = {
      ...data,
      slug,
      views: 0,
    };

    // If user is authenticated, add author field
    if (user) {
      blogData.author = user.userId;
    }

    // Create the blog post
    const blog = await Blog.create(blogData);

    // Populate author data in response
    const populatedBlog = await Blog.findById(blog._id)
      .lean();

    return NextResponse.json(populatedBlog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 