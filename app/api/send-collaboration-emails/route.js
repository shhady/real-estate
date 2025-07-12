import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Property from '../../models/Property';
import User from '../../models/User';
import matchPropertyToClients from '../../services/matchPropertyToClients.js';
import sendEmail from '../../services/sendEmail.js';

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
    console.log(`📧 Selected agents: ${selectedAgentIds.length}`);
    
    // Get all matches for this property
    const matches = await matchPropertyToClients(propertyId);
    
    // Filter for strong matches (score >= 4)
    const strongMatches = matches.filter(m => m.score >= 4);
    
    if (strongMatches.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No strong matches found for this property'
      }, { status: 400 });
    }
    
    // Group matches by agent and filter for selected agents only
    const groupedByAgent = {};
    
    for (const match of strongMatches) {
      const agentId = match.agentId.toString();
      
      // Only include selected agents
      if (selectedAgentIds.includes(agentId)) {
        if (!groupedByAgent[agentId]) {
          groupedByAgent[agentId] = [];
        }
        
        groupedByAgent[agentId].push({
          name: match.client.name,
          phone: match.client.phone,
          email: match.client.email,
          matchReasons: match.reasons.map(reason => {
            switch (reason) {
              case 'location': return 'מיקום';
              case 'propertyType': return 'סוג נכס';
              case 'price': return 'מחיר';
              case 'rooms': return 'חדרים';
              case 'area': return 'שטח';
              default: return reason;
            }
          }),
          score: match.score
        });
      }
    }
    
    const filteredAgentIds = Object.keys(groupedByAgent);
    const totalMatchedClients = Object.values(groupedByAgent).flat().length;
    
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