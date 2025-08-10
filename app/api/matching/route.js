import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Property from '../../models/Property';
import Client from '../../models/Client';
import Call from '../../models/Call';
import { getUser } from '../../lib/auth';

const DEBUG_MATCHING = process.env.DEBUG_MATCHING === '1';

// Helper function to normalize location strings
function normalizeLocation(location) {
  if (!location) return '';
  return location.toLowerCase()
    .replace(/נוף הגליל|نوف هجليل|nazareth illit/gi, 'נוף הגליל')
    .replace(/נצרת|الناصرة|nazareth/gi, 'נצרت')
    .replace(/תל אביב|تل أبيب|tel aviv/gi, 'תל אביב')
    .replace(/חיפה|حيفا|haifa/gi, 'חיפה')
    .replace(/ירושלים|القدس|jerusalem/gi, 'ירושלים')
    .trim();
}

// Helper function to normalize property type
function normalizePropertyType(type) {
  if (!type) return '';
  if (Array.isArray(type)) {
    // Return first normalized item if array accidentally passed
    const first = type[0] || '';
    return normalizePropertyType(first);
  }
  if (typeof type !== 'string') return '';
  return type.toLowerCase()
    .replace(/דירה|شقة|apartment/gi, 'apartment')
    .replace(/בית|بيت|house/gi, 'house')
    .replace(/וילה|فيلا|villa/gi, 'villa')
    .replace(/מסחרי|تجاري|commercial/gi, 'commercial')
    .replace(/משרד|مكتب|office/gi, 'office')
    .replace(/מחסן|مخزن|warehouse/gi, 'warehouse')
    .replace(/אחר|أخر|other/gi, 'other')
    .trim();
}

function normalizeTypeList(types) {
  if (!types) return [];
  const arr = Array.isArray(types) ? types : [types];
  return arr
    .map((t) => normalizePropertyType(t))
    .filter((t) => t && typeof t === 'string');
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

// Helper function to calculate match score
function calculateMatchScore(property, client, options = {}) {
  const fast = options.fast === true;
  let score = 0;
  let totalCriteria = 0;
  let budgetStatus = 'within'; // 'within', 'above', 'way_above'
  let budgetPercentage = 0;

  // STRICT GATES (must be 100% match when provided)
  const propCountry = (property.country || '').trim();
  const clientCountry = (client.preferredCountry || '').trim();
  if (clientCountry && propCountry && propCountry !== clientCountry) {
    return fast ? { score: 0, totalCriteria: 0, isMatch: false } : { score: 0, totalCriteria: 0, matchDetails: [], isMatch: false, budgetStatus: 'within' };
  }

  const propCategory = (property.propertyCategory || '').trim();
  const clientCategory = (client.propertyCategory || '').trim();
  if (propCategory && clientCategory && propCategory !== clientCategory) {
    return fast ? { score: 0, totalCriteria: 0, isMatch: false } : { score: 0, totalCriteria: 0, matchDetails: [], isMatch: false, budgetStatus: 'within' };
  }

  if (client.preferredLocation && property.location) {
    const locProp = normalizeLocation(property.location);
    const locClient = normalizeLocation(client.preferredLocation);
    if (locProp !== locClient) {
      return fast ? { score: 0, totalCriteria: 0, isMatch: false } : { score: 0, totalCriteria: 0, matchDetails: [], isMatch: false, budgetStatus: 'within' };
    }
  }

  const normalizedPropType = normalizePropertyType(property.propertyType);
  const normalizedClientTypes = normalizeTypeList(client.preferredPropertyType);
  if (normalizedClientTypes.length > 0 && !normalizedClientTypes.includes(normalizedPropType)) {
    return fast ? { score: 0, totalCriteria: 0, isMatch: false } : { score: 0, totalCriteria: 0, matchDetails: [], isMatch: false, budgetStatus: 'within' };
  }

  // STRICT GATE: Price may not exceed client's maxPrice by more than 15%
  if (client.maxPrice && property.price) {
    const maxBudget = Number(client.maxPrice);
    const propertyPrice = Number(property.price);
    if (maxBudget > 0 && propertyPrice > maxBudget * 1.15) {
      return fast ? { score: 0, totalCriteria: 0, isMatch: false } : { score: 0, totalCriteria: 0, matchDetails: [], isMatch: false, budgetStatus: 'way_above' };
    }
  }
  
  // 1. Intent/Status matching - NEW 6th criterion
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
  
  // If client is renter and property is not for rent, skip this property entirely
  if (client.intent === 'renter' && property.status !== 'For Rent') {
    return { score: 0, totalCriteria: 1, matchDetails: [], isMatch: false, budgetStatus: 'within' };
  }
  
  // If client is buyer and property is not for sale, skip this property entirely
  if (client.intent === 'buyer' && property.status !== 'For Sale') {
    return { score: 0, totalCriteria: 1, matchDetails: [], isMatch: false, budgetStatus: 'within' };
  }
  
  // 2. Location matching (for scoring only; strict gate already applied if provided)
  const locationMatch = client.preferredLocation
    ? normalizeLocation(property.location) === normalizeLocation(client.preferredLocation)
    : true;
  
  // 3. Property type matching (array-aware)
  const typeMatch = normalizedClientTypes.length > 0
    ? normalizedClientTypes.includes(normalizedPropType)
    : true;
  
  // 4. Price matching - Updated for renters with 110% budget
  let priceMatch = false;
  
  if (client.maxPrice) {
    const maxBudget = Number(client.maxPrice);
    const propertyPrice = Number(property.price || 0);
    budgetPercentage = maxBudget > 0 ? (propertyPrice / maxBudget) * 100 : 0;
    
    if (client.intent === 'renter') {
      // For renters: allow up to 110% of budget
      const maxAllowed = maxBudget * 1.1;
      
      if (propertyPrice <= maxBudget) {
        priceMatch = true;
        budgetStatus = 'within';
      } else if (propertyPrice <= maxAllowed) {
        priceMatch = true;
        budgetStatus = 'above'; // 100-110% of budget
      } else {
        priceMatch = false;
        budgetStatus = 'way_above'; // Above 110%
      }
    } else {
      // For buyers: use original 15% tolerance
      priceMatch = isWithinRange(property.price, client.minPrice, client.maxPrice, 0.15);
      if (propertyPrice > maxBudget) {
        budgetStatus = 'above';
      }
    }
  } else {
    // No price limit set
    priceMatch = true;
  }
  
  // 5. Rooms matching (only minimum rooms is tracked)
  const roomsMatch = isWithinRange(property.bedrooms, client.minRooms, undefined);
  
  // 6. Area matching (only minimum area is tracked)
  const areaMatch = isWithinRange(property.area, client.minArea, undefined, 0.2);
  
  // Count criteria and matches
  if (client.preferredLocation) {
    totalCriteria++;
    if (locationMatch) score++;
  }
  
  if (normalizedClientTypes.length > 0) {
    totalCriteria++;
    if (typeMatch) score++;
  }
  
  if (client.maxPrice) {
    totalCriteria++;
    // Only add score point if price is within budget (not above budget)
    if (priceMatch && budgetStatus !== 'above') score++;
  }
  
  if (client.minRooms) {
    totalCriteria++;
    if (roomsMatch) score++;
  }
  
  if (client.minArea) {
    totalCriteria++;
    if (areaMatch) score++;
  }
  
  // Early return in fast/summary mode: only need isMatch and basic meta
  const minMatchesRequired = 4;
  const isMatch = score >= minMatchesRequired;
  if (fast) {
    return { score, totalCriteria, isMatch };
  }
  
  // Detailed matchDetails only when not in fast mode
  const matchDetails = [];
  
  if (client.intent) {
    const statusText = property.status === 'For Sale' ? 'למכירה' : 'להשכרה';
    const intentText = client.intent === 'buyer' ? 'קונה' : 
                      client.intent === 'renter' ? 'שוכר' : 'קונה ושוכר';
    
    matchDetails.push({
      criterion: 'intent',
      label: 'סטטוס',
      match: intentMatch,
      propertyValue: statusText,
      clientValue: intentText
    });
  }
  
  if (client.preferredLocation) {
    matchDetails.push({
      criterion: 'location',
      label: 'מיקום',
      match: locationMatch,
      propertyValue: property.location,
      clientValue: client.preferredLocation
    });
  }
  
  if (client.preferredPropertyType) {
    matchDetails.push({
      criterion: 'propertyType',
      label: 'סוג נכס',
      match: typeMatch,
      propertyValue: property.propertyType,
      clientValue: client.preferredPropertyType
    });
  }
  
  if (client.maxPrice) {
    let priceDisplay = `₪${property.price ? property.price.toLocaleString() : 'לא צוין'}`;
    if (budgetStatus === 'above' && client.intent === 'renter' && budgetPercentage > 100) {
      const overPercentage = (budgetPercentage - 100).toFixed(1);
      priceDisplay += ` (מעל תקציב ${overPercentage}% יותר)`;
    }
    
    matchDetails.push({
      criterion: 'price',
      label: 'מחיר',
      match: priceMatch,
      propertyValue: priceDisplay,
      clientValue: `עד ₪${client.maxPrice ? client.maxPrice.toLocaleString() : 'ללא מגבלה'}`,
      budgetStatus: budgetStatus,
      budgetPercentage: budgetPercentage
    });
  }
  
  if (client.minRooms) {
    matchDetails.push({
      criterion: 'rooms',
      label: 'חדרים',
      match: roomsMatch,
      propertyValue: property.bedrooms,
      clientValue: `מינימום ${client.minRooms || 0}`
    });
  }
  
  if (client.minArea) {
    matchDetails.push({
      criterion: 'area',
      label: 'שטח',
      match: areaMatch,
      propertyValue: `${property.area} מ"ר`,
      clientValue: `${client.minArea || 0}+ מ"ר`
    });
  }
  
  return { score, totalCriteria, matchDetails, isMatch, budgetStatus, budgetPercentage };
}

// Helper function to calculate call match score
function calculateCallMatchScore(property, call) {
  let score = 0;
  let totalCriteria = 0;
  
  // Core criteria for calls
  const locationMatch = normalizeLocation(property.location) === normalizeLocation(call.location);
  const roomsMatch = call.rooms ? Math.abs(property.bedrooms - call.rooms) <= 1 : true;
  const areaMatch = call.area ? Math.abs(property.area - call.area) <= 20 : true;
  const priceMatch = call.price ? Math.abs(property.price - call.price) <= (call.price * 0.15) : true;
  
  if (call.location) {
    totalCriteria++;
    if (locationMatch) score++;
  }
  
  if (call.rooms) {
    totalCriteria++;
    if (roomsMatch) score++;
  }
  
  if (call.area) {
    totalCriteria++;
    if (areaMatch) score++;
  }
  
  if (call.price) {
    totalCriteria++;
    if (priceMatch) score++;
  }
  
  // Add match details
  const matchDetails = [];
  
  if (call.location) {
    matchDetails.push({
      criterion: 'location',
      label: 'מיקום',
      match: locationMatch,
      propertyValue: property.location,
      clientValue: call.location
    });
  }
  
  if (call.rooms) {
    matchDetails.push({
      criterion: 'rooms',
      label: 'חדרים',
      match: roomsMatch,
      propertyValue: property.bedrooms,
      clientValue: call.rooms
    });
  }
  
  if (call.area) {
    matchDetails.push({
      criterion: 'area',
      label: 'שטח',
      match: areaMatch,
      propertyValue: `${property.area} מ"ר`,
      clientValue: `${call.area} מ"ר`
    });
  }
  
  if (call.price) {
    matchDetails.push({
      criterion: 'price',
      label: 'מחיר',
      match: priceMatch,
      propertyValue: `₪${property.price ? property.price.toLocaleString() : 'לא צוין'}`,
      clientValue: `₪${call.price ? call.price.toLocaleString() : 'לא צוין'}`
    });
  }
  
  return { score, totalCriteria, matchDetails, isMatch: score >= 4 && totalCriteria >= 4 };
}

// GET endpoint for matching
export async function GET(request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'properties-to-clients' or 'clients-to-properties'
    const clientId = searchParams.get('clientId'); // Optional
    const callId = searchParams.get('callId'); // Optional
    const propertyId = searchParams.get('propertyId'); // Optional
    const summary = searchParams.get('summary') === '1'; // Fast counts-only mode

    await connectDB();

    if (type === 'properties-to-clients') {
      // TAB 1: Properties to Clients/Calls
      let propertiesToProcess = [];
      
      if (propertyId) {
        // Individual property matching
        console.log(`Looking for property with ID: ${propertyId} for user: ${user.userId}`);
        const property = await Property.findById(propertyId)
          .populate('user', 'fullName email phone')
          .lean();
        console.log(`Found property:`, property);
        
        if (!property) {
          console.log(`Property with ID ${propertyId} not found`);
          return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }
        
        if (property.user._id.toString() !== user.userId.toString()) {
          console.log(`Property belongs to different user. Property userId: ${property.user._id}, Current user: ${user.userId}`);
          return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }
        
        propertiesToProcess = [property];
        console.log(`Processing individual property: ${property.title}`);
      } else {
        // All properties matching
        propertiesToProcess = await Property.find({ user: user.userId })
          .populate('user', 'fullName email phone')
          .lean();
        console.log(`Processing ${propertiesToProcess.length} properties for user ${user.userId}`);
      }

      const clients = await Client.find({ userId: user.userId }).lean();
      const calls = await Call.find({ userId: user.userId }).lean();

      // SUMMARY MODE: return only counts per property (matched clients count)
      if (summary && !propertyId) {
        const counts = {};
        for (const property of propertiesToProcess) {
          if (!property || !property.title) { continue; }
          let count = 0;
          for (const client of clients) {
            if (!client || !client.clientName) continue;
            // Quick prefilter by intent/status
            if (client.intent === 'buyer' && property.status !== 'For Sale') continue;
            if (client.intent === 'renter' && property.status !== 'For Rent') continue;
            const res = calculateMatchScore(property, client, { fast: true });
            if (res.isMatch) count++;
          }
          counts[property._id] = count;
        }
        return NextResponse.json({ counts });
      }

      const matches = [];

      for (const property of propertiesToProcess) {
        // Skip if property is invalid
        if (!property || !property.title) {
          console.warn('Skipping invalid property:', property);
          continue;
        }
        
        const propertyMatches = {
          property: property,
          matchedClients: [],
          matchedCalls: []
        };

        if (propertyId) {
          // Individual property matching: return ALL matches sorted by score
          console.log(`\n=== INDIVIDUAL PROPERTY MATCHING DEBUG ===`);
          console.log(`Property ID: ${propertyId}`);
          console.log(`Property Title: ${property.title}`);
          console.log(`Property Location: ${property.location}`);
          console.log(`Property Type: ${property.propertyType}`);
          console.log(`Property Price: ${property.price}`);
          console.log(`Property Rooms: ${property.bedrooms}`);
          console.log(`Property Area: ${property.area}`);
          console.log(`Available Clients: ${clients.length}`);
          console.log(`Available Calls: ${calls.length}`);

          // Match clients
          console.log(`\n=== MATCHING CLIENTS ===`);
          console.log(`Property Status: ${property.status}`);
          console.log(`Property Details: Location=${property.location}, Type=${property.propertyType}, Price=${property.price}, Rooms=${property.bedrooms}, Area=${property.area}`);
          
          for (const client of clients) {
            // Skip if client is invalid
            if (!client || !client.clientName) {
              console.warn('Skipping invalid client in property matching:', client);
              continue;
            }
            
            console.log(`\n--- Checking Client: ${client.clientName} ---`);
            console.log(`Client Intent: ${client.intent}`);
            console.log(`Client Location: ${client.preferredLocation}`);
            console.log(`Client Type: ${client.preferredPropertyType}`);
            console.log(`Client Price: ${client.maxPrice}`);
            console.log(`Client Area: ${client.minArea}`);
            
            const matchResult = calculateMatchScore(property, client);
            console.log(`Result: ${client.clientName} - Score: ${matchResult.score}/${matchResult.totalCriteria} - IsMatch: ${matchResult.isMatch} - BudgetStatus: ${matchResult.budgetStatus}`);
            
            if (matchResult.isMatch) {
              propertyMatches.matchedClients.push({
                client: client,
                score: matchResult.score,
                totalCriteria: matchResult.totalCriteria,
                matchDetails: matchResult.matchDetails,
                budgetStatus: matchResult.budgetStatus,
                budgetPercentage: matchResult.budgetPercentage
              });
            }
          }

          // Match calls
          console.log(`\n=== MATCHING CALLS ===`);
          for (const call of calls) {
            const matchResult = calculateCallMatchScore(property, call);
            console.log(`Call: ${call.summary?.substring(0, 30) || 'No summary'} - Score: ${matchResult.score}/${matchResult.totalCriteria} - IsMatch: ${matchResult.isMatch}`);
            
            if (matchResult.isMatch) {
              propertyMatches.matchedCalls.push({
                call: call,
                score: matchResult.score,
                totalCriteria: matchResult.totalCriteria,
                matchDetails: matchResult.matchDetails
              });
            }
          }

          // Sort matches by score (highest first)
          propertyMatches.matchedClients.sort((a, b) => b.score - a.score);
          propertyMatches.matchedCalls.sort((a, b) => b.score - a.score);

          console.log(`\n=== FINAL PROPERTY MATCHING RESULTS ===`);
          console.log(`Total client matches: ${propertyMatches.matchedClients.length}`);
          console.log(`Total call matches: ${propertyMatches.matchedCalls.length}`);
          console.log(`Client matches:`, propertyMatches.matchedClients.map(m => `${m.client.clientName} (${m.score}/${m.totalCriteria})`));
          console.log(`Call matches:`, propertyMatches.matchedCalls.map(m => `${m.call.summary?.substring(0, 30) || 'No summary'} (${m.score}/${m.totalCriteria})`));
          console.log(`=======================================\n`);

          // Always include the property in the response, even if no matches
          matches.push(propertyMatches);
          
          // Return immediately for individual property matching
          return NextResponse.json({ matches });
        } else {
          // Bulk property matching: use existing logic
          // Match clients
          for (const client of clients) {
            // Skip if client is invalid
            if (!client || !client.clientName) {
              console.warn('Skipping invalid client in properties-to-clients:', client);
              continue;
            }
            
            const matchResult = calculateMatchScore(property, client);
            if (matchResult.isMatch) {
              propertyMatches.matchedClients.push({
                client: client,
                score: matchResult.score,
                totalCriteria: matchResult.totalCriteria,
                matchDetails: matchResult.matchDetails
              });
            }
          }

          // Match calls
          for (const call of calls) {
            const matchResult = calculateCallMatchScore(property, call);
            if (matchResult.isMatch) {
              propertyMatches.matchedCalls.push({
                call: call,
                score: matchResult.score,
                totalCriteria: matchResult.totalCriteria,
                matchDetails: matchResult.matchDetails
              });
            }
          }

          // Only include properties with matches
          if (propertyMatches.matchedClients.length > 0 || propertyMatches.matchedCalls.length > 0) {
            matches.push(propertyMatches);
          }
        }
      }

      // Return the matches for bulk property matching
      return NextResponse.json({ matches });

    } else if (type === 'clients-to-properties') {
      // TAB 2: Clients to Properties
      let clientsToProcess = [];
      
      if (clientId) {
        // Individual client matching
        console.log(`Looking for client with ID: ${clientId} for user: ${user.userId}`);
        const client = await Client.findById(clientId).lean();
        console.log(`Found client:`, client);
        
        if (!client) {
          console.log(`Client with ID ${clientId} not found`);
          return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }
        
        if (client.userId.toString() !== user.userId.toString()) {
          console.log(`Client belongs to different user. Client userId: ${client.userId}, Current user: ${user.userId}`);
          return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }
        
        clientsToProcess = [client];
        console.log(`Processing individual client: ${client.clientName}`);
      } else {
        // All clients matching
        clientsToProcess = await Client.find({ userId: user.userId }).lean();
        console.log(`Processing ${clientsToProcess.length} clients for user ${user.userId}`);
      }
      
      // Fetch properties ONCE for this request
      const userProperties = await Property.find({ user: user.userId }).populate('user', 'fullName email phone').lean();
      const externalProperties = await Property.find({ user: { $ne: user.userId } }).populate('user', 'fullName email phone').lean();
      const allProps = [...userProperties, ...externalProperties];

      // SUMMARY MODE: return only counts per client
      if (summary && !clientId) {
        const counts = {};
        for (const client of clientsToProcess) {
          if (!client || !client.clientName) { continue; }
          let count = 0;
          for (const prop of allProps) {
            // Quick pre-filter by intent/status to skip irrelevant properties
            if (client.intent === 'buyer' && prop.status !== 'For Sale') continue;
            if (client.intent === 'renter' && prop.status !== 'For Rent') continue;
            const res = calculateMatchScore(prop, client, { fast: true });
            if (res.isMatch) count++;
          }
          counts[client._id] = count;
        }
        return NextResponse.json({ counts });
      }

      const matches = [];

      for (const client of clientsToProcess) {
        if (!client || !client.clientName) continue;
        const clientMatches = { client, matchedProperties: [] };

        // Individual client matching: ALL matches sorted by priority
        const allPossibleMatches = [];
        // Priority 1: 5/5 from user properties
        for (const property of userProperties) {
          if (!property || !property.title) continue;
          const matchResult = calculateMatchScore(property, client);
          if (matchResult.isMatch && matchResult.score === matchResult.totalCriteria) {
            allPossibleMatches.push({ property, score: matchResult.score, totalCriteria: matchResult.totalCriteria, matchDetails: matchResult.matchDetails, budgetStatus: matchResult.budgetStatus, budgetPercentage: matchResult.budgetPercentage, isExternal: false, priority: 1 });
          }
        }
        // Priority 2: 5/5 external
        for (const property of externalProperties) {
          if (!property || !property.title) continue;
          const matchResult = calculateMatchScore(property, client);
          if (matchResult.isMatch && matchResult.score === matchResult.totalCriteria) {
            allPossibleMatches.push({ property, score: matchResult.score, totalCriteria: matchResult.totalCriteria, matchDetails: matchResult.matchDetails, budgetStatus: matchResult.budgetStatus, budgetPercentage: matchResult.budgetPercentage, isExternal: true, priority: 2 });
          }
        }
        // Priority 3: 4/5 user
        for (const property of userProperties) {
          if (!property || !property.title) continue;
          const matchResult = calculateMatchScore(property, client);
          if (matchResult.isMatch && matchResult.score < matchResult.totalCriteria) {
            allPossibleMatches.push({ property, score: matchResult.score, totalCriteria: matchResult.totalCriteria, matchDetails: matchResult.matchDetails, budgetStatus: matchResult.budgetStatus, budgetPercentage: matchResult.budgetPercentage, isExternal: false, priority: 3 });
          }
        }
        // Priority 4: 4/5 external
        for (const property of externalProperties) {
          if (!property || !property.title) continue;
          const matchResult = calculateMatchScore(property, client);
          if (matchResult.isMatch && matchResult.score < matchResult.totalCriteria) {
            allPossibleMatches.push({ property, score: matchResult.score, totalCriteria: matchResult.totalCriteria, matchDetails: matchResult.matchDetails, budgetStatus: matchResult.budgetStatus, budgetPercentage: matchResult.budgetPercentage, isExternal: true, priority: 4 });
          }
        }

        // Sort
        allPossibleMatches.sort((a, b) => (a.priority !== b.priority ? a.priority - b.priority : b.score - a.score));
        clientMatches.matchedProperties = allPossibleMatches;

        if (clientId || clientMatches.matchedProperties.length > 0) {
          matches.push(clientMatches);
        }
      }

      return NextResponse.json({ matches });

    } else if (type === 'calls-to-properties') {
      // Individual call matching
      let callsToProcess = [];
      
      if (callId) {
        // Individual call matching
        console.log(`Looking for call with ID: ${callId} for user: ${user.userId}`);
        const call = await Call.findById(callId).lean();
        console.log(`Found call:`, call);
        
        if (!call) {
          console.log(`Call with ID ${callId} not found`);
          return NextResponse.json({ error: 'Call not found' }, { status: 404 });
        }
        
        if (call.userId.toString() !== user.userId.toString()) {
          console.log(`Call belongs to different user. Call userId: ${call.userId}, Current user: ${user.userId}`);
          return NextResponse.json({ error: 'Call not found' }, { status: 404 });
        }
        
        callsToProcess = [call];
        console.log(`Processing individual call`);
      } else {
        // All calls matching
        callsToProcess = await Call.find({ userId: user.userId }).lean();
        console.log(`Processing ${callsToProcess.length} calls for user ${user.userId}`);
      }
      
      const matches = [];

      for (const call of callsToProcess) {
        // Skip if call is invalid
        if (!call || !call.clientName) {
          console.warn('Skipping invalid call:', call);
          continue;
        }
        
        const callMatches = {
          call: call,
          matchedProperties: []
        };

        // Step 1: Get user's own properties
        const userProperties = await Property.find({ user: user.userId })
          .populate('user', 'fullName email phone')
          .lean();

        // Step 2: Get external properties
        const externalProperties = await Property.find({ 
          user: { $ne: user.userId } 
        })
          .populate('user', 'fullName email phone')
          .lean();

        // Collect ALL matches with priority system
        const allPossibleMatches = [];

        // Priority 1: 5/5 matches from signed-in user's properties
        for (const property of userProperties) {
          if (!property || !property.title) continue;
          
          const matchResult = calculateCallMatchScore(property, call);
          if (matchResult.isMatch && matchResult.score === matchResult.totalCriteria) {
            allPossibleMatches.push({
              property: property,
              score: matchResult.score,
              totalCriteria: matchResult.totalCriteria,
              matchDetails: matchResult.matchDetails,
              isExternal: false,
              priority: 1
            });
          }
        }

        // Priority 2: 5/5 matches from other users' properties
        for (const property of externalProperties) {
          if (!property || !property.title) continue;
          
          const matchResult = calculateCallMatchScore(property, call);
          if (matchResult.isMatch && matchResult.score === matchResult.totalCriteria) {
            allPossibleMatches.push({
              property: property,
              score: matchResult.score,
              totalCriteria: matchResult.totalCriteria,
              matchDetails: matchResult.matchDetails,
              isExternal: true,
              priority: 2
            });
          }
        }

        // Priority 3: 4/5 matches from signed-in user's properties
        for (const property of userProperties) {
          if (!property || !property.title) continue;
          
          const matchResult = calculateCallMatchScore(property, call);
          if (matchResult.isMatch && matchResult.score < matchResult.totalCriteria) {
            allPossibleMatches.push({
              property: property,
              score: matchResult.score,
              totalCriteria: matchResult.totalCriteria,
              matchDetails: matchResult.matchDetails,
              isExternal: false,
              priority: 3
            });
          }
        }

        // Priority 4: 4/5 matches from other users' properties
        for (const property of externalProperties) {
          if (!property || !property.title) continue;
          
          const matchResult = calculateCallMatchScore(property, call);
          if (matchResult.isMatch && matchResult.score < matchResult.totalCriteria) {
            allPossibleMatches.push({
              property: property,
              score: matchResult.score,
              totalCriteria: matchResult.totalCriteria,
              matchDetails: matchResult.matchDetails,
              isExternal: true,
              priority: 4
            });
          }
        }

        // Sort all matches by priority, then by score
        allPossibleMatches.sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority; // Priority 1 first, then 2, 3, 4
          }
          return b.score - a.score; // Within same priority, higher score first
        });

        callMatches.matchedProperties = allPossibleMatches;

        // For individual call matching, always include the call even if no matches
        // For bulk matching, only include calls with matches
        if (callId || callMatches.matchedProperties.length > 0) {
          matches.push(callMatches);
        }
      }

      return NextResponse.json({ matches });

    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in matching:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 