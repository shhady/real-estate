import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Property from '../../models/Property';
import Call from '../../models/Call';
import Client from '../../models/Client';
import User from '../../models/User';
import { getUser } from '../../lib/auth';

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

    // Get all properties for the agent
    const properties = await Property.find({ user: user.userId });

    // Get all calls for the agent
    const calls = await Call.find({ userId: user.userId });

    // Get all clients for the agent
    const clients = await Client.find({ userId: user.userId });

    // Get user data for interactions
    const userData = await User.findById(user.userId);

    // Calculate total views (from user interactions)
    const totalViews = userData?.interactions?.profileViews || 0;

    // Calculate inquiries from properties
    const inquiries = properties.reduce((acc, property) => ({
      whatsapp: acc.whatsapp + (property.inquiries?.whatsapp || 0),
      email: acc.email + (property.inquiries?.email || 0),
      calls: acc.calls + (property.inquiries?.calls || 0)
    }), { whatsapp: 0, email: 0, calls: 0 });

    // Add user interactions to inquiries
    if (userData?.interactions) {
      inquiries.whatsapp += userData.interactions.whatsapp || 0;
      inquiries.email += userData.interactions.email || 0;
      inquiries.calls += userData.interactions.phone || 0;
    }

    // Calculate total inquiries
    const totalInquiries = inquiries.whatsapp + inquiries.email + inquiries.calls;

    // Calculate properties by status
    const propertiesByStatus = properties.reduce((acc, property) => {
      acc[property.status] = (acc[property.status] || 0) + 1;
      return acc;
    }, {});

    // Calculate properties by type
    const propertiesByType = properties.reduce((acc, property) => {
      acc[property.propertyType] = (acc[property.propertyType] || 0) + 1;
      return acc;
    }, {});

    // Get recent inquiries from calls and properties
    const recentInquiries = [];

    // Add calls as inquiries
    calls.forEach(call => {
      recentInquiries.push({
        propertyTitle: call.propertyNotes || 'שיחה כללית',
        type: 'Call',
        date: call.date || call.createdAt,
        clientName: call.clientId ? 'לקוח קיים' : 'לקוח חדש'
      });
    });

    // Add property inquiries
    properties.forEach(property => {
      if (property.inquiries?.whatsapp > 0) {
        recentInquiries.push({
          propertyTitle: property.title,
          type: 'WhatsApp',
          date: property.updatedAt,
          clientName: 'פנייה דרך נכס'
        });
      }
      if (property.inquiries?.email > 0) {
        recentInquiries.push({
          propertyTitle: property.title,
          type: 'Email',
          date: property.updatedAt,
          clientName: 'פנייה דרך נכס'
        });
      }
      if (property.inquiries?.calls > 0) {
        recentInquiries.push({
          propertyTitle: property.title,
          type: 'Call',
          date: property.updatedAt,
          clientName: 'פנייה דרך נכס'
        });
      }
    });

    // Sort by date and take the most recent 10
    const sortedRecentInquiries = recentInquiries
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    // Calculate conversion rate
    const conversionRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : 0;

    // Get top performing properties (by inquiries)
    const topPerformingProperties = properties
      .map(property => ({
        title: property.title,
        totalInquiries: (property.inquiries?.whatsapp || 0) + (property.inquiries?.email || 0) + (property.inquiries?.calls || 0),
        views: property.views || 0,
        dealScore: property.dealScore || 0
      }))
      .sort((a, b) => b.totalInquiries - a.totalInquiries)
      .slice(0, 5);

    // Calculate monthly trends (last 6 months)
    const monthlyTrends = {
      views: [],
      inquiries: []
    };

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      // Calculate views for this month (mock data for now)
      const monthlyViews = Math.floor(Math.random() * 100) + 50;
      
      // Calculate inquiries for this month
      const monthlyInquiries = calls.filter(call => {
        const callDate = new Date(call.date || call.createdAt);
        return callDate >= month && callDate <= monthEnd;
      }).length;

      monthlyTrends.views.push({
        month: month.toLocaleDateString('he-IL', { month: 'short', year: 'numeric' }),
        value: monthlyViews
      });

      monthlyTrends.inquiries.push({
        month: month.toLocaleDateString('he-IL', { month: 'short', year: 'numeric' }),
        value: monthlyInquiries
      });
    }

    return NextResponse.json({
      totalProperties: properties.length,
      totalViews,
      totalInquiries,
      conversionRate: parseFloat(conversionRate),
      inquiries,
      propertiesByStatus,
      propertiesByType,
      recentInquiries: sortedRecentInquiries,
      topPerformingProperties,
      monthlyTrends,
      totalClients: clients.length,
      totalCalls: calls.length
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 