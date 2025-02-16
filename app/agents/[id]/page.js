import { notFound } from 'next/navigation';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import Property from '@/app/models/Property';
import AgentProfile from '@/app/components/agents/AgentProfile';
import mongoose from 'mongoose';

export default async function AgentPage({ params }) {
  const { id } = await params;

  try {
    await connectDB();
    
    let agent;
    
    // Check if the id is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      // Try to find agent by ID
      agent = await User.findById(id).select('-password').lean();
    }
    
    // If not found by ID or if ID is not a valid ObjectId, try to find by slug
    if (!agent) {
      agent = await User.findOne({ slug: id }).select('-password').lean();
    }

    if (!agent) {
      notFound();
    }

    // Fetch agent's properties
    const properties = await Property.find({ user: agent._id })
      .populate('user', 'fullName email phone')
      .select('title description price location images status bedrooms bathrooms area propertyType createdAt updatedAt')
      .lean();

    // Initialize analytics if not exists
    if (!agent.analytics) {
      agent.analytics = {
        profileViews: { total: 0 },
        interactions: {
          whatsapp: 0,
          email: 0,
          phone: 0,
          social: 0
        }
      };
    }

    // Convert ObjectId to string and combine data
    const sanitizedAgent = {
      ...agent,
      _id: agent._id.toString(),
      createdAt: agent.createdAt?.toISOString(),
      updatedAt: agent.updatedAt?.toISOString(),
      properties: properties.map(property => ({
        ...property,
        _id: property._id.toString(),
        user: property.user?._id.toString() || agent._id.toString(),
        createdAt: property.createdAt?.toISOString(),
        updatedAt: property.updatedAt?.toISOString(),
        images: property.images?.map(img => ({
          secure_url: img.secure_url,
          publicId: img.publicId
        })) || []
      }))
    };

    return <AgentProfile agent={sanitizedAgent} />;
  } catch (error) {
    console.error('Error fetching agent:', error);
    throw error;
  }
}
