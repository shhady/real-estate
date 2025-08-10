import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Property from '../../models/Property';
import Client from '../../models/Client';
import User from '../../models/User';
import { getUser } from '../../lib/auth';

// Helper function to normalize location strings
function normalizeLocation(location) {
  if (!location) return '';
  return location.toLowerCase()
    .replace(/נוף הגליל|نوف هجليل|nazareth illit/gi, 'נוף הגליל')
    .replace(/נצרת|الناصرة|nazareth/gi, 'נצרת')
    .replace(/תל אביב|تل أبيب|tel aviv/gi, 'תל אביב')
    .replace(/חיפה|حيفا|haifa/gi, 'חיפה')
    .replace(/ירושלים|القدس|jerusalem/gi, 'ירושלים')
    .trim();
}

// Helper function to normalize property type
function normalizePropertyType(type) {
  if (!type) return '';
  if (Array.isArray(type)) {
    const first = type[0] || '';
    return normalizePropertyType(first);
  }
  if (typeof type !== 'string') return '';
  return type.toLowerCase()
    .replace(/דירה|شقة|apartment/gi, 'apartment')
    .replace(/בית|بيت|منزل|house/gi, 'house')
    .replace(/וילה|فيلا|villa/gi, 'villa')
    .replace(/מסחרי|تجاري|commercial/gi, 'commercial')
    .replace(/משרד|مكتب|office/gi, 'office')
    .replace(/מחסן|مخزن|warehouse/gi, 'warehouse')
    .replace(/קונדו|كوندو|condo/gi, 'condo')
    .replace(/אחר|أخر|other/gi, 'other')
    .trim();
}

function normalizeTypeList(types) {
  if (!types) return [];
  const arr = Array.isArray(types) ? types : [types];
  return arr.map((t) => normalizePropertyType(t)).filter(Boolean);
}

// Helper function to check if values match within a range
function isWithinRange(value, min, max, tolerance = 0) {
  if (!value || (!min && !max)) return true;
  
  const numValue = Number(value);
  const numMin = Number(min);
  const numMax = Number(max);
  
  if (min && max) {
    return numValue >= (numMin * (1 - tolerance)) && numValue <= (numMax * (1 + tolerance));
  } else if (min) {
    return numValue >= (numMin * (1 - tolerance));
  } else if (max) {
    return numValue <= (numMax * (1 + tolerance));
  }
  
  return true;
}

// Helper function to calculate match score for collaboration
function calculateCollaborationMatchScore(property, client) {
  let score = 0;
  let totalCriteria = 0;
  let budgetStatus = 'within';
  
  // STRICT GATES (must match 100% if provided)
  const propCountry = (property.country || '').trim();
  const clientCountry = (client.preferredCountry || '').trim();
  if (clientCountry && propCountry && propCountry !== clientCountry) {
    return { score: 0, totalCriteria: 0, isMatch: false, budgetStatus: 'within' };
  }
  const propCategory = (property.propertyCategory || '').trim();
  const clientCategory = (client.propertyCategory || '').trim();
  if (propCategory && clientCategory && propCategory !== clientCategory) {
    return { score: 0, totalCriteria: 0, isMatch: false, budgetStatus: 'within' };
  }
  if (client.preferredLocation && property.location) {
    const locProp = normalizeLocation(property.location);
    const locClient = normalizeLocation(client.preferredLocation);
    if (locProp !== locClient) {
      return { score: 0, totalCriteria: 0, isMatch: false, budgetStatus: 'within' };
    }
  }
  const normalizedPropType = normalizePropertyType(property.propertyType);
  const normalizedClientTypes = normalizeTypeList(client.preferredPropertyType);
  if (normalizedClientTypes.length > 0 && !normalizedClientTypes.includes(normalizedPropType)) {
    return { score: 0, totalCriteria: 0, isMatch: false, budgetStatus: 'within' };
  }
  // STRICT price cap: not more than 15% above client's maxPrice
  if (client.maxPrice && property.price) {
    const maxBudget = Number(client.maxPrice);
    const propertyPrice = Number(property.price);
    if (maxBudget > 0 && propertyPrice > maxBudget * 1.15) {
      return { score: 0, totalCriteria: 0, isMatch: false, budgetStatus: 'way_above' };
    }
  }
  
  // 1. Intent/Status matching - Must match for collaboration
  let intentMatch = false;
  if (client.intent) {
    totalCriteria++;
    if (client.intent === 'buyer' && property.status === 'For Sale') {
      intentMatch = true;
      score++;
    } else if (client.intent === 'renter' && property.status === 'For Rent') {
      intentMatch = true;
      score++;
    } else if (client.intent === 'both' && (property.status === 'For Sale' || property.status === 'For Rent')) {
      intentMatch = true;
      score++;
    }
  }
  
  // If client intent doesn't match property status, skip entirely
  if (!intentMatch) {
    return { score: 0, totalCriteria: 1, isMatch: false, budgetStatus: 'within' };
  }
  
  // 2. Location matching (for scoring only; strict gate above)
  if (client.preferredLocation) {
    totalCriteria++;
    const locationMatch = normalizeLocation(property.location) === normalizeLocation(client.preferredLocation);
    if (locationMatch) score++;
  }
  
  // 3. Property type matching (array-aware)
  if (normalizedClientTypes.length > 0) {
    totalCriteria++;
    const typeMatch = normalizedClientTypes.includes(normalizedPropType);
    if (typeMatch) score++;
  }
  
  // 4. Price matching
  if (client.maxPrice) {
    totalCriteria++;
    const maxBudget = Number(client.maxPrice);
    const propertyPrice = Number(property.price || 0);
    const budgetPercentage = (propertyPrice / maxBudget) * 100;
    // Unified 15% rule for collaboration
    const cap = maxBudget * 1.15;
    if (propertyPrice <= maxBudget) {
      score++;
      budgetStatus = 'within';
    } else if (propertyPrice <= cap) {
      budgetStatus = 'above';
    } else {
      return { score: 0, totalCriteria, isMatch: false, budgetStatus: 'way_above' };
    }
  }
  
  // 5. Rooms matching
  if (client.minRooms) {
    totalCriteria++;
    const roomsMatch = isWithinRange(property.bedrooms, client.minRooms);
    if (roomsMatch) score++;
  }
  
  // 6. Area matching
  if (client.minArea) {
    totalCriteria++;
    const areaMatch = isWithinRange(property.area, client.minArea, 0.2);
    if (areaMatch) score++;
  }
  
  // For collaboration: minimum 5/6 match required
  const isMatch = score >= 5;
  
  return { score, totalCriteria, isMatch, budgetStatus };
}

export async function GET(request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const minMatch = parseInt(searchParams.get('minMatch') || '5');

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    await connectDB();

    // Get the property
    const property = await Property.findById(propertyId).lean();
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Make sure the property belongs to the current user
    if (property.user.toString() !== user.userId.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log(`\n=== COLLABORATION MATCHING DEBUG ===`);
    console.log(`Property: ${property.title}`);
    console.log(`Property Status: ${property.status}`);
    console.log(`Looking for ${property.status === 'For Sale' ? 'buyers' : 'renters'}`);
    console.log(`Minimum match required: ${minMatch}/6`);

    // Get all other users (agents) except the current user
    const otherUsers = await User.find({ 
      _id: { $ne: user.userId },
      role: 'agent' 
    }).lean();

    const matchingAgents = [];

    for (const agent of otherUsers) {
      // Get clients for this agent
      const clients = await Client.find({ 
        userId: agent._id,
        // Filter by intent based on property status
        intent: property.status === 'For Sale' ? 'buyer' : 'renter'
      }).lean();

      console.log(`\n--- Agent: ${agent.fullName} ---`);
      console.log(`Total ${property.status === 'For Sale' ? 'buyer' : 'renter'} clients: ${clients.length}`);

      const matchingClients = [];

      for (const client of clients) {
        const matchResult = calculateCollaborationMatchScore(property, client);
        
        console.log(`Client: ${client.clientName} - Score: ${matchResult.score}/6 - IsMatch: ${matchResult.isMatch}`);

        if (matchResult.isMatch) {
          matchingClients.push({
            ...client,
            matchScore: matchResult.score,
            budgetStatus: matchResult.budgetStatus
          });
        }
      }

      if (matchingClients.length > 0) {
        matchingAgents.push({
          ...agent,
          matchingClients: matchingClients.sort((a, b) => b.matchScore - a.matchScore)
        });
      }

      console.log(`Matching clients for ${agent.fullName}: ${matchingClients.length}`);
    }

    // Sort agents by number of matching clients (descending)
    matchingAgents.sort((a, b) => b.matchingClients.length - a.matchingClients.length);

    console.log(`\n=== COLLABORATION RESULTS ===`);
    console.log(`Total matching agents: ${matchingAgents.length}`);
    console.log(`Total matching clients: ${matchingAgents.reduce((sum, agent) => sum + agent.matchingClients.length, 0)}`);
    console.log(`===============================\n`);

    return NextResponse.json({ 
      agents: matchingAgents,
      property: property,
      totalAgents: matchingAgents.length,
      totalClients: matchingAgents.reduce((sum, agent) => sum + agent.matchingClients.length, 0)
    });

  } catch (error) {
    console.error('Error in collaboration matching:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 