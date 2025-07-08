import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Property from '../../models/Property';
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
    const properties = await Property.find({ agent: user.userId });

    // Calculate total views (this would need to be implemented with actual view tracking)
    const totalViews = properties.reduce((sum, property) => sum + (property.views || 0), 0);

    // Calculate inquiries
    const inquiries = properties.reduce((acc, property) => ({
      whatsapp: acc.whatsapp + (property.inquiries?.whatsapp || 0),
      email: acc.email + (property.inquiries?.email || 0),
      calls: acc.calls + (property.inquiries?.calls || 0)
    }), { whatsapp: 0, email: 0, calls: 0 });

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

    // Get recent inquiries (this would need to be implemented with actual inquiry tracking)
    const recentInquiries = properties
      .flatMap(property => [
        ...(property.inquiries?.whatsapp ? [{
          propertyTitle: property.title,
          type: 'WhatsApp',
          date: new Date() // This should be the actual inquiry date
        }] : []),
        ...(property.inquiries?.email ? [{
          propertyTitle: property.title,
          type: 'Email',
          date: new Date() // This should be the actual inquiry date
        }] : []),
        ...(property.inquiries?.calls ? [{
          propertyTitle: property.title,
          type: 'Call',
          date: new Date() // This should be the actual inquiry date
        }] : [])
      ])
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);

    return NextResponse.json({
      totalProperties: properties.length,
      totalViews,
      inquiries,
      propertiesByStatus,
      propertiesByType,
      recentInquiries
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 