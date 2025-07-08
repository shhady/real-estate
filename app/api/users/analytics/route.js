import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Property from '../../../models/Property';
import { getUser } from '../../../lib/auth';

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

    // Fetch user with analytics data
    const userData = await User.findById(user.userId)
      .select('analytics properties')
      .lean();

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch user's properties with their analytics
    const properties = await Property.find({ user: user.userId })
      .select('title location status price inquiries images createdAt')
      .lean();

    // Calculate property-specific analytics
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

    // Calculate total property inquiries
    const totalPropertyInquiries = propertyAnalytics.reduce(
      (acc, property) => acc + property.inquiries.total,
      0
    );

    // Ensure analytics object exists with default values
    const analytics = userData.analytics || {
      profileViews: { total: 0, unique: 0 },
      interactions: {
        whatsapp: { total: 0, unique: 0 },
        email: { total: 0, unique: 0 },
        phone: { total: 0, unique: 0 }
      },
      lastInteractions: []
    };

    // Calculate interaction totals
    const totalInteractions = {
      total: analytics.interactions.whatsapp.total + 
             analytics.interactions.email.total + 
             analytics.interactions.phone.total,
      unique: analytics.interactions.whatsapp.unique + 
              analytics.interactions.email.unique + 
              analytics.interactions.phone.unique
    };

    // Get recent interactions with serialized data
    const recentInteractions = (analytics.lastInteractions || [])
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

    const dailyInteractions = recentInteractions
      .filter(interaction => new Date(interaction.timestamp) > thirtyDaysAgo)
      .reduce((acc, interaction) => {
        const date = new Date(interaction.timestamp).toISOString().split('T')[0];
        acc[date] = acc[date] || { views: 0, whatsapp: 0, email: 0, phone: 0 };
        acc[date][interaction.type === 'view' ? 'views' : interaction.type]++;
        return acc;
      }, {});

    // Prepare the response
    const response = {
      summary: {
        profileViews: analytics.profileViews,
        interactions: analytics.interactions,
        totalInteractions,
        totalProperties: properties.length,
        totalPropertyInquiries
      },
      propertyAnalytics: propertyAnalytics,
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

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 