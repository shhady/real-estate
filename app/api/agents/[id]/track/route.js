import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import Property from '@/app/models/Property';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { type, propertyId } = await request.json();
    const headersList = await headers();
    
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip');
    const userAgent = headersList.get('user-agent');
    const referrer = headersList.get('referer');

    await connectDB();

    // Validate interaction type
    if (!['view', 'whatsapp', 'email', 'phone'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid interaction type' },
        { status: 400 }
      );
    }

    // Find user and check for recent interactions
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Initialize analytics if not exists
    if (!user.analytics) {
      user.analytics = {
        profileViews: { total: 0, unique: 0 },
        interactions: {
          whatsapp: { total: 0, unique: 0 },
          email: { total: 0, unique: 0 },
          phone: { total: 0, unique: 0 }
        },
        lastInteractions: []
      };
    }

    // Check for recent interaction from same IP
    const recentInteraction = user.analytics.lastInteractions?.find(interaction => 
      interaction.ip === ip && 
      interaction.type === type &&
      (new Date() - new Date(interaction.timestamp)) < 1000 * 60 * 60 // 1 hour
    );

    // For views, if recent interaction exists, just return current analytics
    if (recentInteraction && type === 'view') {
      const analyticsData = await generateAnalyticsResponse(user);
      return NextResponse.json(analyticsData);
    }

    // Update analytics based on interaction type
    if (type === 'view') {
      user.analytics.profileViews.total += 1;
      if (!recentInteraction) {
        user.analytics.profileViews.unique += 1;
      }
    } else {
      user.analytics.interactions[type].total += 1;
      if (!recentInteraction) {
        user.analytics.interactions[type].unique += 1;
      }
    }

    // Add new interaction to lastInteractions array
    user.analytics.lastInteractions.unshift({
      type,
      timestamp: new Date(),
      ip,
      propertyId: propertyId || null,
      userAgent,
      referrer
    });

    // Keep only last 50 interactions
    user.analytics.lastInteractions = user.analytics.lastInteractions.slice(0, 50);

    // Save the updated user
    await user.save();

    // Generate and return analytics response
    const analyticsData = await generateAnalyticsResponse(user);
    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Error tracking interaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate analytics response
async function generateAnalyticsResponse(user) {
  // Get user's properties
  const properties = await Property.find({ user: user._id })
    .select('title location status price inquiries images createdAt')
    .lean();

  // Calculate property analytics
  const propertyAnalytics = properties.map(property => ({
    _id: property._id.toString(),
    title: property.title,
    location: property.location,
    status: property.status,
    price: property.price,
    thumbnail: property.images[0]?.secure_url,
    createdAt: property.createdAt,
    inquiries: {
      total: (property.inquiries?.whatsapp || 0) + 
             (property.inquiries?.email || 0) + 
             (property.inquiries?.calls || 0),
      whatsapp: property.inquiries?.whatsapp || 0,
      email: property.inquiries?.email || 0,
      calls: property.inquiries?.calls || 0
    }
  }));

  // Calculate total interactions
  const totalInteractions = {
    total: user.analytics.interactions.whatsapp.total + 
           user.analytics.interactions.email.total + 
           user.analytics.interactions.phone.total,
    unique: user.analytics.interactions.whatsapp.unique + 
            user.analytics.interactions.email.unique + 
            user.analytics.interactions.phone.unique
  };

  // Get recent interactions
  const recentInteractions = user.analytics.lastInteractions
    .slice(0, 10)
    .map(interaction => ({
      _id: interaction._id.toString(),
      type: interaction.type,
      timestamp: interaction.timestamp.toISOString(),
      ip: interaction.ip,
      propertyId: interaction.propertyId?.toString()
    }));

  // Calculate daily analytics for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyInteractions = user.analytics.lastInteractions
    .filter(interaction => interaction.timestamp > thirtyDaysAgo)
    .reduce((acc, interaction) => {
      const date = interaction.timestamp.toISOString().split('T')[0];
      acc[date] = acc[date] || { views: 0, whatsapp: 0, email: 0, phone: 0 };
      acc[date][interaction.type === 'view' ? 'views' : interaction.type]++;
      return acc;
    }, {});

  return {
    summary: {
      profileViews: user.analytics.profileViews,
      interactions: user.analytics.interactions,
      totalInteractions,
      totalProperties: properties.length,
      totalPropertyInquiries: propertyAnalytics.reduce(
        (acc, property) => acc + property.inquiries.total, 0
      )
    },
    propertyAnalytics,
    recentInteractions,
    dailyAnalytics: Object.entries(dailyInteractions).map(([date, counts]) => ({
      date,
      ...counts
    })),
    propertiesByStatus: properties.reduce((acc, property) => {
      acc[property.status] = (acc[property.status] || 0) + 1;
      return acc;
    }, {})
  };
}

// Helper function to determine device type from user agent
function getUserDevice(userAgent) {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  if (/ipad/i.test(userAgent)) return 'tablet';
  return 'desktop';
} 