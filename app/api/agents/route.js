import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import Property from '@/app/models/Property';

// GET all agents
export async function GET() {
  try {
    await connectDB();

    // Find all agents and populate their properties
    const agents = await User.find({ role: 'agent' })
      .select('-password')
      .lean();

    // For each agent, fetch their properties
    const agentsWithProperties = await Promise.all(
      agents.map(async (agent) => {
        const properties = await Property.find({ user: agent._id })
          .select('title description price location images status bedrooms bathrooms area propertyType')
          .lean();

        // Helper function to safely convert MongoDB ObjectId to string
        const safeToString = (obj) => obj ? obj.toString() : null;
        
        // Helper function to safely format date
        const safeDate = (date) => date ? new Date(date).toISOString() : null;

        // Serialize the agent data
        const serializedAgent = {
          ...agent,
          _id: safeToString(agent._id),
          createdAt: safeDate(agent.createdAt),
          updatedAt: safeDate(agent.updatedAt),
          profileImage: agent.profileImage ? {
            secure_url: agent.profileImage.secure_url,
            publicId: agent.profileImage.publicId
          } : null,
          properties: properties.map(prop => ({
            ...prop,
            _id: safeToString(prop._id),
            user: safeToString(prop.user),
            createdAt: safeDate(prop.createdAt),
            updatedAt: safeDate(prop.updatedAt),
            images: prop.images?.map(img => ({
              secure_url: img.secure_url,
              publicId: img.publicId
            })) || []
          }))
        };

        return serializedAgent;
      })
    );

    return NextResponse.json(agentsWithProperties, { status: 200 });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST new agent
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Check if agent already exists
    const existingAgent = await User.findOne({ email: data.email });
    if (existingAgent) {
      return NextResponse.json({ error: 'Agent already exists' }, { status: 400 });
    }

    // Create new agent with role 'agent'
    const agent = await User.create({
      ...data,
      role: 'agent'
    });

    // Remove password from response
    const agentWithoutPassword = {
      _id: agent._id.toString(),
      fullName: agent.fullName,
      email: agent.email,
      role: agent.role,
      profileImage: agent.profileImage,
    };

    return NextResponse.json(agentWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 