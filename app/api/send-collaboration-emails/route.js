import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Property from '../../models/Property';
import User from '../../models/User';
import Client from '../../models/Client';
import sendEmail from '../../services/sendEmail.js';

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
    .replace(/בית|منزل|house/gi, 'house')
    .replace(/וילה|فيلا|villa/gi, 'villa')
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

// Helper function to calculate match score for collaboration
function calculateCollaborationMatchScore(property, client) {
  let score = 0;
  let totalCriteria = 0;
  let budgetStatus = 'within';
  let matchReasons = [];
  
  // 1. Intent/Status matching - Must match for collaboration
  let intentMatch = false;
  if (client.intent) {
    totalCriteria++;
    if (client.intent === 'buyer' && property.status === 'For Sale') {
      intentMatch = true;
      score++;
      matchReasons.push('סטטוס');
    } else if (client.intent === 'renter' && property.status === 'For Rent') {
      intentMatch = true;
      score++;
      matchReasons.push('סטטוס');
    } else if (client.intent === 'both' && (property.status === 'For Sale' || property.status === 'For Rent')) {
      intentMatch = true;
      score++;
      matchReasons.push('סטטוס');
    }
  }
  
  // If client intent doesn't match property status, skip entirely
  if (!intentMatch) {
    return { score: 0, totalCriteria: 1, isMatch: false, budgetStatus: 'within', matchReasons: [] };
  }
  
  // 2. Location matching
  if (client.preferredLocation) {
    totalCriteria++;
    const locationMatch = normalizeLocation(property.location) === normalizeLocation(client.preferredLocation);
    if (locationMatch) {
      score++;
      matchReasons.push('מיקום');
    }
  }
  
  // 3. Property type matching
  if (client.preferredPropertyType) {
    totalCriteria++;
    const typeMatch = normalizePropertyType(property.propertyType) === normalizePropertyType(client.preferredPropertyType);
    if (typeMatch) {
      score++;
      matchReasons.push('סוג נכס');
    }
  }
  
  // 4. Price matching
  if (client.maxPrice) {
    totalCriteria++;
    const maxBudget = Number(client.maxPrice);
    const propertyPrice = Number(property.price || 0);
    const budgetPercentage = (propertyPrice / maxBudget) * 100;
    
    if (client.intent === 'renter') {
      // For renters: allow up to 110% of budget
      const maxAllowed = maxBudget * 1.1;
      
      if (propertyPrice <= maxBudget) {
        score++;
        budgetStatus = 'within';
        matchReasons.push('מחיר');
      } else if (propertyPrice <= maxAllowed) {
        // Don't add score for above budget (5/6 instead of 6/6)
        budgetStatus = 'above';
        matchReasons.push('מחיר (מעל תקציב)');
      } else {
        // Above 110% - skip entirely
        return { score: 0, totalCriteria, isMatch: false, budgetStatus: 'way_above', matchReasons: [] };
      }
    } else {
      // For buyers: use original 15% tolerance
      const priceMatch = isWithinRange(property.price, client.minPrice, client.maxPrice, 0.15);
      if (priceMatch) {
        score++;
        matchReasons.push('מחיר');
      }
      if (propertyPrice > maxBudget) {
        budgetStatus = 'above';
      }
    }
  }
  
  // 5. Rooms matching
  if (client.minRooms || client.maxRooms) {
    totalCriteria++;
    const roomsMatch = isWithinRange(property.bedrooms, client.minRooms, client.maxRooms);
    if (roomsMatch) {
      score++;
      matchReasons.push('חדרים');
    }
  }
  
  // 6. Area matching
  if (client.minArea || client.maxArea) {
    totalCriteria++;
    const areaMatch = isWithinRange(property.area, client.minArea, client.maxArea, 0.2);
    if (areaMatch) {
      score++;
      matchReasons.push('שטח');
    }
  }
  
  // For collaboration: minimum 5/6 match required
  const isMatch = score >= 5;
  
  return { score, totalCriteria, isMatch, budgetStatus, matchReasons };
}

export async function POST(request) {
  try {
    const { propertyId, selectedAgentIds } = await request.json();
    
    if (!propertyId || !selectedAgentIds || selectedAgentIds.length === 0) {
      return NextResponse.json({ 
        error: 'Property ID and selected agent IDs are required' 
      }, { status: 400 });
    }

    await connectDB();
    
    // Get the property with user details
    const property = await Property.findById(propertyId)
      .populate('user', 'fullName email phone')
      .lean();
    
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    console.log(`📧 Sending collaboration emails for property: ${property.title}`);
    console.log(`📧 Property Status: ${property.status}`);
    console.log(`📧 Looking for ${property.status === 'For Sale' ? 'buyers' : 'renters'} only`);
    console.log(`📧 Selected agents: ${selectedAgentIds.length}`);
    
    // Get matching agents with proper intent filtering
    const groupedByAgent = {};
    
    for (const agentId of selectedAgentIds) {
      // Get clients for this agent with strict intent filtering
      const clients = await Client.find({ 
        userId: agentId,
        // Filter by intent based on property status
        intent: property.status === 'For Sale' ? 'buyer' : 'renter'
      }).lean();

      console.log(`📧 Agent ${agentId}: Found ${clients.length} ${property.status === 'For Sale' ? 'buyer' : 'renter'} clients`);

      const matchingClients = [];

      for (const client of clients) {
        const matchResult = calculateCollaborationMatchScore(property, client);
        
        console.log(`📧 Client: ${client.clientName} - Score: ${matchResult.score}/6 - IsMatch: ${matchResult.isMatch}`);

        if (matchResult.isMatch) {
          matchingClients.push({
            name: client.clientName,
            phone: client.phoneNumber,
            email: client.email,
            matchReasons: matchResult.matchReasons,
            score: matchResult.score
          });
        }
      }

      if (matchingClients.length > 0) {
        groupedByAgent[agentId] = matchingClients;
      }
    }
    
    const filteredAgentIds = Object.keys(groupedByAgent);
    const totalMatchedClients = Object.values(groupedByAgent).flat().length;
    
    console.log(`📧 Final results: ${filteredAgentIds.length} agents with ${totalMatchedClients} matching clients`);
    
    if (filteredAgentIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No matches found for selected agents'
      }, { status: 400 });
    }
    
    const listingAgent = property.user;
    
    // Send email to listing agent
    const listingAgentEmailResult = await sendEmail({
      to: listingAgent.email,
      subject: `🎯 הנכס שלך תואם ל-${totalMatchedClients} לקוחות!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
          <h2 style="color: #2563eb;">🎯 חדשות נהדרות על הנכס שלך!</h2>
          
          <p>שלום <strong>${listingAgent.fullName}</strong>,</p>
          
          <p>הנכס שלך <strong>"${property.title}"</strong> ב<strong>${property.location}</strong> תואם ל-<strong>${totalMatchedClients}</strong> לקוחות מ-<strong>${filteredAgentIds.length}</strong> סוכנים שונים.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">פרטי הנכס:</h3>
            <ul style="margin: 10px 0;">
              <li><strong>מיקום:</strong> ${property.location}</li>
              <li><strong>מחיר:</strong> ₪${property.price ? property.price.toLocaleString() : 'לא צוין'}</li>
              <li><strong>חדרים:</strong> ${property.bedrooms}</li>
              <li><strong>שטח:</strong> ${property.area} מ"ר</li>
              <li><strong>סוג:</strong> ${property.propertyType}</li>
            </ul>
          </div>
          
          <p style="background-color: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            בגלל שהפעלת שיתוף פעולה, הודענו לסוכנים הנבחרים שתואמים לנכס. הם עשויים ליצור איתך קשר כדי לסגור עסקאות מהר יותר! 🚀
          </p>
          
          <p>בברכה,<br>
          <strong>צוות פלטפורמת הנדל"ן</strong></p>
        </div>
      `
    });
    
    // Send emails to each selected matched agent
    const agentEmailResults = [];
    
    for (const agentId of filteredAgentIds) {
      const agent = await User.findById(agentId).lean();
      if (!agent) {
        console.error(`❌ Agent not found: ${agentId}`);
        continue;
      }
      
      const clientList = groupedByAgent[agentId];
      
      // Create client details HTML
      const clientDetailsHtml = clientList.map(client => `
        <li style="margin: 10px 0; padding: 10px; background-color: #f9fafb; border-radius: 6px;">
          <strong>${client.name}</strong> 
          ${client.phone ? `<br>📞 ${client.phone}` : ''}
          ${client.email ? `<br>📧 ${client.email}` : ''}
          <br><span style="color: #6b7280; font-size: 14px;">סיבות התאמה: ${client.matchReasons.join(', ')}</span>
          <br><span style="color: #059669; font-weight: bold;">ציון התאמה: ${client.score}/5</span>
        </li>
      `).join('');
      
      const agentEmailResult = await sendEmail({
        to: agent.email,
        subject: `🔥 נכס חדש תואם ללקוחות שלך!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <h2 style="color: #dc2626;">🔥 הזדמנות שיתוף פעולה חדשה!</h2>
            
            <p>שלום <strong>${agent.fullName}</strong>,</p>
            
            <p>נכס חדש שהוכנס על ידי הסוכן <strong>${listingAgent.fullName}</strong> ב<strong>${property.location}</strong> תואם ל-<strong>${clientList.length}</strong> מהלקוחות שלך!</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">פרטי הנכס:</h3>
              <ul style="margin: 10px 0;">
                <li><strong>כותרת:</strong> ${property.title}</li>
                <li><strong>מיקום:</strong> ${property.location}</li>
                <li><strong>מחיר:</strong> ₪${property.price ? property.price.toLocaleString() : 'לא צוין'}</li>
                <li><strong>חדרים:</strong> ${property.bedrooms}</li>
                <li><strong>שטח:</strong> ${property.area} מ"ר</li>
                <li><strong>סוג:</strong> ${property.propertyType}</li>
              </ul>
            </div>
            
            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #065f46; margin-top: 0;">הלקוחות התואמים שלך:</h3>
              <ul style="list-style: none; padding: 0;">
                ${clientDetailsHtml}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/properties/${property._id}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                צפה בפרטי הנכס
              </a>
            </div>
            
            <p style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <strong>השלבים הבאים:</strong> צור קשר עם הסוכן המפרסם כדי לבחון הזדמנויות שיתוף פעולה ולסגור עסקאות מהר יותר!
            </p>
            
            <p>בברכה,<br>
            <strong>צוות פלטפורמת הנדל"ן</strong></p>
          </div>
        `
      });
      
      agentEmailResults.push(agentEmailResult);
      console.log(`📧 Email sent to agent ${agent.fullName}:`, agentEmailResult.success);
    }
    
    const successfulEmails = agentEmailResults.filter(result => result.success).length;
    
    console.log(`✅ Collaboration emails sent: ${successfulEmails}/${filteredAgentIds.length} successful`);
    
    return NextResponse.json({
      success: true,
      totalMatches: totalMatchedClients,
      agentsNotified: filteredAgentIds.length,
      emailsSent: successfulEmails,
      listingAgentEmailResult,
      agentEmailResults
    });
    
  } catch (error) {
    console.error('❌ Error sending collaboration emails:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 