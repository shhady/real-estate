import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Property from '../../models/Property';
import Client from '../../models/Client';
import Call from '../../models/Call';
import { getUser } from '../../lib/auth';

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
  return type.toLowerCase()
    .replace(/דירה|شقة|apartment/gi, 'apartment')
    .replace(/בית|بيت|house/gi, 'house')
    .replace(/וילה|فيلا|villa/gi, 'villa')
    .replace(/מסחרי|تجاري|commercial/gi, 'commercial')
    .trim();
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
function calculateMatchScore(property, client) {
  let score = 0;
  let totalCriteria = 0;
  
  // Core criteria (location, type, price, rooms, area)
  const locationMatch = normalizeLocation(property.location) === normalizeLocation(client.preferredLocation);
  const typeMatch = normalizePropertyType(property.propertyType) === normalizePropertyType(client.preferredPropertyType);
  const priceMatch = isWithinRange(property.price, client.minPrice, client.maxPrice, 0.15);
  const roomsMatch = isWithinRange(property.bedrooms, client.minRooms, client.maxRooms);
  const areaMatch = isWithinRange(property.area, client.minArea, client.maxArea, 0.2);
  
  if (client.preferredLocation) {
    totalCriteria++;
    if (locationMatch) score++;
  }
  
  if (client.preferredPropertyType) {
    totalCriteria++;
    if (typeMatch) score++;
  }
  
  if (client.minPrice || client.maxPrice) {
    totalCriteria++;
    if (priceMatch) score++;
  }
  
  if (client.minRooms || client.maxRooms) {
    totalCriteria++;
    if (roomsMatch) score++;
  }
  
  if (client.minArea || client.maxArea) {
    totalCriteria++;
    if (areaMatch) score++;
  }
  
  // Add match details
  const matchDetails = [];
  
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
  
  if (client.minPrice || client.maxPrice) {
    matchDetails.push({
      criterion: 'price',
      label: 'מחיר',
      match: priceMatch,
      propertyValue: `₪${property.price ? property.price.toLocaleString() : 'לא צוין'}`,
      clientValue: `₪${client.minPrice || 0} - ${client.maxPrice ? `₪${client.maxPrice.toLocaleString()}` : 'ללא מגבלה'}`
    });
  }
  
  if (client.minRooms || client.maxRooms) {
    matchDetails.push({
      criterion: 'rooms',
      label: 'חדרים',
      match: roomsMatch,
      propertyValue: property.bedrooms,
      clientValue: `${client.minRooms || 0} - ${client.maxRooms || 'ללא מגבלה'}`
    });
  }
  
  if (client.minArea || client.maxArea) {
    matchDetails.push({
      criterion: 'area',
      label: 'שטח',
      match: areaMatch,
      propertyValue: `${property.area} מ"ר`,
      clientValue: `${client.minArea || 0} - ${client.maxArea || 'ללא מגבלה'} מ"ר`
    });
  }
  
  // More flexible matching criteria:
  // - If client has 3+ criteria, need at least 3 matches
  // - If client has 2 criteria, need at least 2 matches
  // - If client has 1 criterion, need 1 match
  // - Minimum 2 criteria required for matching
  const minCriteriaRequired = Math.max(2, Math.min(totalCriteria, 4));
  const minMatchesRequired = Math.max(2, Math.min(totalCriteria, 4));
  
  const isMatch = totalCriteria >= minCriteriaRequired && score >= minMatchesRequired;
  
  return { score, totalCriteria, matchDetails, isMatch };
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
    const clientId = searchParams.get('clientId'); // Optional: for individual client matching
    const callId = searchParams.get('callId'); // Optional: for individual call matching
    const propertyId = searchParams.get('propertyId'); // Optional: for individual property matching

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
          for (const client of clients) {
            // Skip if client is invalid
            if (!client || !client.clientName) {
              console.warn('Skipping invalid client in property matching:', client);
              continue;
            }
            
            const matchResult = calculateMatchScore(property, client);
            console.log(`Client: ${client.clientName} - Score: ${matchResult.score}/${matchResult.totalCriteria} - IsMatch: ${matchResult.isMatch}`);
            
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
      
      const matches = [];

      for (const client of clientsToProcess) {
        // Skip if client is invalid
        if (!client || !client.clientName) {
          console.warn('Skipping invalid client:', client);
          continue;
        }
        
        const clientMatches = {
          client: client,
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

        // Step 3: Get ALL properties for debugging
        const allProperties = await Property.find({})
          .populate('user', 'fullName email phone')
          .lean();

        console.log(`\n=== DATABASE STATE DEBUG ===`);
        console.log(`Total properties in database: ${allProperties.length}`);
        console.log(`User properties (${user.userId}): ${userProperties.length}`);
        console.log(`External properties: ${externalProperties.length}`);
        
        // Log all properties with basic info
        console.log(`\n=== ALL PROPERTIES LIST ===`);
        allProperties.forEach((prop, index) => {
          console.log(`${index + 1}. ${prop.title} | Location: ${prop.location} | Type: ${prop.propertyType} | Price: ${prop.price} | Rooms: ${prop.bedrooms} | Area: ${prop.area} | User: ${prop.user?.fullName || 'Unknown'}`);
        });
        
        console.log(`\n=== USER PROPERTIES LIST ===`);
        userProperties.forEach((prop, index) => {
          console.log(`${index + 1}. ${prop.title} | Location: ${prop.location} | Type: ${prop.propertyType} | Price: ${prop.price} | Rooms: ${prop.bedrooms} | Area: ${prop.area}`);
        });
        
        console.log(`\n=== EXTERNAL PROPERTIES LIST ===`);
        externalProperties.forEach((prop, index) => {
          console.log(`${index + 1}. ${prop.title} | Location: ${prop.location} | Type: ${prop.propertyType} | Price: ${prop.price} | Rooms: ${prop.bedrooms} | Area: ${prop.area} | User: ${prop.user?.fullName || 'Unknown'}`);
        });

        console.log(`Found ${externalProperties.length} external properties for user ${user.userId}`);
        
        // Quick check: list all users who have properties
        const allPropertiesWithUsers = await Property.find({}).populate('user', 'fullName email').lean();
        const userPropertyCounts = {};
        allPropertiesWithUsers.forEach(prop => {
          if (prop.user) {
            const userId = prop.user._id.toString();
            userPropertyCounts[userId] = (userPropertyCounts[userId] || 0) + 1;
          }
        });
        console.log(`Property counts by user:`, userPropertyCounts);
        console.log(`Current user ID: ${user.userId}`);

        if (clientId) {
          // Individual client matching: return ALL matches sorted by priority
          console.log(`\n=== INDIVIDUAL CLIENT MATCHING DEBUG ===`);
          console.log(`Client ID: ${clientId}`);
          console.log(`Client Name: ${client.clientName}`);
          console.log(`Client Location: ${client.preferredLocation}`);
          console.log(`Client Property Type: ${client.preferredPropertyType}`);
          console.log(`Client Price Range: ${client.minPrice} - ${client.maxPrice}`);
          console.log(`Client Rooms Range: ${client.minRooms} - ${client.maxRooms}`);
          console.log(`Client Area Range: ${client.minArea} - ${client.maxArea}`);
          console.log(`User Properties Count: ${userProperties.length}`);
          console.log(`External Properties Count: ${externalProperties.length}`);
          
          const allPossibleMatches = [];

          // Priority 1: 5/5 matches from signed-in user's properties
          console.log(`\n=== CHECKING PRIORITY 1: 5/5 FROM USER PROPERTIES ===`);
          for (const property of userProperties) {
            if (!property || !property.title) continue;
            
            const matchResult = calculateMatchScore(property, client);
            console.log(`Property: ${property.title} - Score: ${matchResult.score}/${matchResult.totalCriteria} - IsMatch: ${matchResult.isMatch} - Perfect: ${matchResult.score === matchResult.totalCriteria}`);
            
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
          console.log(`\n=== CHECKING PRIORITY 2: 5/5 FROM EXTERNAL PROPERTIES ===`);
          for (const property of externalProperties) {
            if (!property || !property.title) continue;
            
            const matchResult = calculateMatchScore(property, client);
            console.log(`Property: ${property.title} - Score: ${matchResult.score}/${matchResult.totalCriteria} - IsMatch: ${matchResult.isMatch} - Perfect: ${matchResult.score === matchResult.totalCriteria}`);
            
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
          console.log(`\n=== CHECKING PRIORITY 3: PARTIAL FROM USER PROPERTIES ===`);
          for (const property of userProperties) {
            if (!property || !property.title) continue;
            
            const matchResult = calculateMatchScore(property, client);
            console.log(`Property: ${property.title} - Score: ${matchResult.score}/${matchResult.totalCriteria} - IsMatch: ${matchResult.isMatch} - Partial: ${matchResult.score < matchResult.totalCriteria}`);
            
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
          console.log(`\n=== CHECKING PRIORITY 4: PARTIAL FROM EXTERNAL PROPERTIES ===`);
          for (const property of externalProperties) {
            if (!property || !property.title) continue;
            
            const matchResult = calculateMatchScore(property, client);
            console.log(`Property: ${property.title} - Score: ${matchResult.score}/${matchResult.totalCriteria} - IsMatch: ${matchResult.isMatch} - Partial: ${matchResult.score < matchResult.totalCriteria}`);
            
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

          clientMatches.matchedProperties = allPossibleMatches;

          console.log(`\n=== ALL MATCHING RESULTS FOR: ${client.clientName} ===`);
          console.log(`Priority 1 (5/5 own): ${allPossibleMatches.filter(m => m.priority === 1).length} matches`);
          console.log(`Priority 2 (5/5 external): ${allPossibleMatches.filter(m => m.priority === 2).length} matches`);
          console.log(`Priority 3 (4/5 own): ${allPossibleMatches.filter(m => m.priority === 3).length} matches`);
          console.log(`Priority 4 (4/5 external): ${allPossibleMatches.filter(m => m.priority === 4).length} matches`);
          console.log(`Total matches: ${allPossibleMatches.length}`);
          console.log(`All matches:`, allPossibleMatches.map(m => `Priority ${m.priority}: ${m.property.title} (${m.score}/${m.totalCriteria}${m.isExternal ? ' - External' : ' - Own'})`));
          console.log(`================================================\n`);
          
          // Always include the client in the response, even if no matches
          matches.push(clientMatches);
          
          console.log(`\n=== FINAL RESPONSE DEBUG ===`);
          console.log(`Matches array length: ${matches.length}`);
          console.log(`Client matches length: ${clientMatches.matchedProperties.length}`);
          console.log(`Returning client:`, {
            id: client._id,
            name: client.clientName,
            matchCount: clientMatches.matchedProperties.length
          });
          console.log(`============================\n`);
          
          // Return immediately for individual client matching
          return NextResponse.json({ matches });
          
        } else {
          // Bulk client matching: return ALL matches sorted by priority (no limit)
          const allPossibleMatches = [];

          // Priority 1: 5/5 matches from signed-in user's properties
          for (const property of userProperties) {
            if (!property || !property.title) continue;
            
            const matchResult = calculateMatchScore(property, client);
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
            
            const matchResult = calculateMatchScore(property, client);
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
            
            const matchResult = calculateMatchScore(property, client);
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
            
            const matchResult = calculateMatchScore(property, client);
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

          clientMatches.matchedProperties = allPossibleMatches;

          // For bulk matching, only include clients with matches
          if (clientMatches.matchedProperties.length > 0) {
            matches.push(clientMatches);
          }
        }
      }

      // Return the matches for bulk client matching
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