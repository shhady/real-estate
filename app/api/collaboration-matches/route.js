import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Property from '../../models/Property';
import User from '../../models/User';
import Client from '../../models/Client';
import matchPropertyToClients from '../../services/matchPropertyToClients.js';

export async function POST(request) {
  try {
    const { propertyId } = await request.json();
    
    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    await connectDB();
    
    // Get the property
    const property = await Property.findById(propertyId).lean();
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    console.log('🔍 Getting collaboration matches for property:', property.title);
    
    // Get all matches for this property
    const matches = await matchPropertyToClients(propertyId);
    
    // Filter for strong matches (score >= 4)
    const strongMatches = matches.filter(m => m.score >= 4);
    
    if (strongMatches.length === 0) {
      return NextResponse.json({
        success: true,
        property: { id: property._id, title: property.title },
        totalMatches: 0,
        agents: []
      });
    }
    
    // Group matches by agent
    const groupedByAgent = {};
    
    for (const match of strongMatches) {
      const agentId = match.agentId.toString();
      
      if (!groupedByAgent[agentId]) {
        groupedByAgent[agentId] = {
          agentId,
          clients: [],
          totalClients: 0
        };
      }
      
      groupedByAgent[agentId].clients.push({
        name: match.client.name,
        phone: match.client.phone,
        email: match.client.email,
        score: match.score,
        reasons: match.reasons
      });
      groupedByAgent[agentId].totalClients++;
    }
    
    // Get agent details
    const agentIds = Object.keys(groupedByAgent);
    const agents = await User.find({
      _id: { $in: agentIds }
    }).select('_id fullName email phone agencyName').lean();
    
    // Build response with agent details
    const agentList = agents.map(agent => ({
      id: agent._id.toString(),
      name: agent.fullName,
      email: agent.email,
      phone: agent.phone,
      agencyName: agent.agencyName,
      clientCount: groupedByAgent[agent._id.toString()].totalClients,
      clients: groupedByAgent[agent._id.toString()].clients
    }));
    
    // Sort by client count (descending)
    agentList.sort((a, b) => b.clientCount - a.clientCount);
    
    console.log(`🎯 Found ${strongMatches.length} matches across ${agentList.length} agents`);
    
    return NextResponse.json({
      success: true,
      property: {
        id: property._id,
        title: property.title,
        location: property.location
      },
      totalMatches: strongMatches.length,
      totalAgents: agentList.length,
      agents: agentList
    });
    
  } catch (error) {
    console.error('Error getting collaboration matches:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 