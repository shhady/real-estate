import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Property from '../../../models/Property';

export async function GET(request, { params }) {
  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params;
    
    console.log('📢 Fetching agent with ID:', id);

    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    await connectDB();
    console.log("✅ MongoDB connected");

    // Fetch agent and populate properties
    const agent = await User.findById(id)
      .select('-password')
      .populate('properties');

    if (!agent) {
      console.log("❌ Agent not found!");
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    console.log("✅ Agent found:", agent);
    return NextResponse.json(agent);
  } catch (error) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
