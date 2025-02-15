import { notFound } from 'next/navigation';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import Property from '@/app/models/Property';
import AgentProfile from '@/app/components/agents/AgentProfile';

export default async function AgentPage({ params }) {
  const { id } = await params;

  try {
    await connectDB();
    
    // Fetch agent details
    const agent = await User.findById(id)
      .select('-password')
      .lean();

    if (!agent) {
      notFound();
    }

    // Fetch agent's properties
    const properties = await Property.find({ user: id })
      .select('title description price location images status bedrooms bathrooms area propertyType user')
      .lean();

    // Initialize analytics if not exists
    if (!agent.analytics) {
      agent.analytics = {
        profileViews: { total: 0, unique: 0 },
        interactions: {
          whatsapp: { total: 0, unique: 0 },
          email: { total: 0, unique: 0 },
          phone: { total: 0, unique: 0 }
        },
        lastInteractions: []
      };
    }

    // Convert ObjectId to string and combine data
    const sanitizedAgent = {
      ...agent,
      _id: agent._id.toString(),
      createdAt: agent.createdAt?.toISOString(),
      updatedAt: agent.updatedAt?.toISOString(),
      analytics: {
        profileViews: agent.analytics.profileViews,
        interactions: agent.analytics.interactions,
        lastInteractions: agent.analytics.lastInteractions.map(interaction => ({
          _id: interaction._id.toString(),
          type: interaction.type,
          timestamp: interaction.timestamp.toISOString(),
          ip: interaction.ip,
          propertyId: interaction.propertyId?.toString()
        }))
      },
      properties: properties.map(property => ({
        ...property,
        _id: property._id.toString(),
        user: property.user.toString(),
        createdAt: property.createdAt?.toISOString(),
        updatedAt: property.updatedAt?.toISOString(),
        images: property.images.map(img => ({
          secure_url: img.secure_url,
          publicId: img.publicId
        }))
      }))
    };

    return <AgentProfile agent={sanitizedAgent} />;
  } catch (error) {
    console.error('Error fetching agent:', error);
    throw error;
  }
}
