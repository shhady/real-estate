import connectDB from '../lib/mongodb';
import Property from '../models/Property';
import Client from '../models/Client';

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
  return type.toLowerCase()
    .replace(/דירה|شقة|apartment/gi, 'apartment')
    .replace(/בית|بيت|house/gi, 'house')
    .replace(/וילה|فيلا|villa/gi, 'villa')
    .replace(/מסחרי|تجاري|commercial/gi, 'commercial')
    .replace(/משרד|مكتب|office/gi, 'office')
    .replace(/מחסן|مخزن|warehouse/gi, 'warehouse')
    .replace(/אחر|أخر|other/gi, 'other')
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
  const reasons = [];
  
  // Core criteria (location, type, price, rooms, area)
  const locationMatch = normalizeLocation(property.location) === normalizeLocation(client.preferredLocation);
  const typeMatch = normalizePropertyType(property.propertyType) === normalizePropertyType(client.preferredPropertyType);
  const priceMatch = isWithinRange(property.price, client.maxPrice, 0.15);
  const roomsMatch = isWithinRange(property.bedrooms, client.minRooms);
  const areaMatch = isWithinRange(property.area, client.minArea, 0.2);
  
  if (client.preferredLocation) {
    totalCriteria++;  
    if (locationMatch) {
      score++;
      reasons.push('location');
    }
  }
  
  if (client.preferredPropertyType) {
    totalCriteria++;
    if (typeMatch) {
      score++;
      reasons.push('propertyType');
    }
  }
  
  if (client.maxPrice) {
    totalCriteria++;
    if (priceMatch) {
      score++;
      reasons.push('price');
    }
  }
  
  if (client.minRooms) {
    totalCriteria++;
    if (roomsMatch) {
      score++;
      reasons.push('rooms');
    }
  }
  
  if (client.minArea) {
    totalCriteria++;
    if (areaMatch) {
      score++;
      reasons.push('area');
    }
  }
  
  // More flexible matching criteria:
  // - If client has 3+ criteria, need at least 3 matches
  // - If client has 2 criteria, need at least 2 matches
  // - If client has 1 criterion, need 1 match
  // - Minimum 2 criteria required for matching
  const minCriteriaRequired = Math.max(2, Math.min(totalCriteria, 4));
  const minMatchesRequired = Math.max(2, Math.min(totalCriteria, 4));
  
  const isMatch = totalCriteria >= minCriteriaRequired && score >= minMatchesRequired;
  
  return { 
    score, 
    totalCriteria, 
    reasons, 
    isMatch,
    normalizedScore: totalCriteria > 0 ? Math.round((score / totalCriteria) * 5) : 0 // Convert to 0-5 scale
  };
}

/**
 * Match a property against all clients in the database
 * @param {string} propertyId - The property ID to match
 * @returns {Array} Array of client matches with score 0-5
 */
export default async function matchPropertyToClients(propertyId) {
  try {
    await connectDB();
    
    // Get the property
    const property = await Property.findById(propertyId).lean();
    if (!property) {
      console.error(`Property with ID ${propertyId} not found`);
      return [];
    }
    
    // Get all clients from all agents (excluding the property owner's clients)
    const allClients = await Client.find({
      userId: { $ne: property.user } // Exclude clients belonging to the property owner
    }).lean();
    
    console.log(`🔍 Matching property "${property.title}" against ${allClients.length} clients`);
    
    const matches = [];
    
    for (const client of allClients) {
      // Skip if client is invalid
      if (!client || !client.clientName) {
        console.warn('Skipping invalid client:', client);
        continue;
      }
      
      const matchResult = calculateMatchScore(property, client);
      
      if (matchResult.isMatch) {
        matches.push({
          clientId: client._id,
          agentId: client.userId,
          score: matchResult.normalizedScore, // 0-5 scale
          reasons: matchResult.reasons,
          client: {
            name: client.clientName,
            phone: client.phone,
            email: client.email
          }
        });
      }
    }
    
    // Sort matches by score (highest first)
    matches.sort((a, b) => b.score - a.score);
    
    console.log(`🎯 Found ${matches.length} matches for property "${property.title}"`);
    console.log(`Matches:`, matches.map(m => `${m.client.name} (${m.score}/5) - ${m.reasons.join(', ')}`));
    
    return matches;
    
  } catch (error) {
    console.error('Error in matchPropertyToClients:', error);
    return [];
  }
} 