import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Blog from '@/app/models/Blog';
import { getUser } from '@/app/lib/auth';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const blogs = await Blog.find({ author: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 