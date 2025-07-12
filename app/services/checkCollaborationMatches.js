import matchPropertyToClients from './matchPropertyToClients.js';
import sendEmail from './sendEmail.js';
import User from '../models/User.js';
import Client from '../models/Client.js';

/**
 * Check for collaboration matches and send email notifications
 * @param {Object} property - The property document
 */
export async function checkCollaborationMatches(property) {
  try {
    console.log(`🤝 בדיקת תאמות שיתוף פעולה לנכס: ${property.title}`);
    
    // Get all matches for this property
    const matches = await matchPropertyToClients(property._id);
    
    // Filter for strong matches (score >= 4)
    const strongMatches = matches.filter(m => m.score >= 4);
    
    if (strongMatches.length === 0) {
      console.log(`❌ לא נמצאו תאמות חזקות לנכס: ${property.title}`);
      return;
    }
    
    console.log(`🎯 נמצאו ${strongMatches.length} תאמות חזקות לנכס: ${property.title}`);
    
    // Group matches by agent
    const groupedByAgent = {};
    
    for (const match of strongMatches) {
      const agentId = match.agentId.toString();
      
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
    
    const matchedAgentIds = Object.keys(groupedByAgent);
    const totalMatchedClients = strongMatches.length;
    
    // Get the listing agent
    const listingAgent = await User.findById(property.user).lean();
    if (!listingAgent) {
      console.error(`❌ הסוכן המפרסם לא נמצא: ${property.title}`);
      return;
    }
    
    console.log(`📧 שליחת דואר אלקטרוני לסוכן המפרסם ול-${matchedAgentIds.length} סוכנים תואמים`);
    
    // Send email to listing agent
    const listingAgentEmailResult = await sendEmail({
      to: listingAgent.email,
      subject: `🎯 הנכס שלך תואם ל-${totalMatchedClients} לקוחות!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
          <h2 style="color: #2563eb;">🎯 חדשות נהדרות על הנכס שלך!</h2>
          
          <p>שלום <strong>${listingAgent.fullName}</strong>,</p>
          
          <p>הנכס שלך <strong>"${property.title}"</strong> ב<strong>${property.location}</strong> תואם ל-<strong>${totalMatchedClients}</strong> לקוחות מ-<strong>${matchedAgentIds.length}</strong> סוכנים שונים.</p>
          
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
            בגלל שהפעלת שיתוף פעולה, הודענו לסוכנים התואמים. הם עשויים ליצור איתך קשר כדי לסגור עסקאות מהר יותר! 🚀
          </p>
          
          <p>בברכה,<br>
          <strong>צוות פלטפורמת הנדל"ן</strong></p>
        </div>
      `
    });
    
    console.log(`📧 Listing agent email result:`, listingAgentEmailResult);
    
    // Send emails to each matched agent
    const agentEmailResults = [];
    
    for (const agentId of matchedAgentIds) {
      const agent = await User.findById(agentId).lean();
      if (!agent) {
        console.error(`❌ הסוכן לא נמצא: ${agentId}`);
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
      console.log(`📧 תוצאת דואר אלקטרוני לסוכן ${agent.fullName}:`, agentEmailResult);
    }
    
    console.log(`✅ שיתוף פעולה תואם נסגר לנכס: ${property.title}`);
    console.log(`📊 תוצאות: ${totalMatchedClients} לקוחות תואמים, ${matchedAgentIds.length} סוכנים שולחים`);
    
    return {
      success: true,
      totalMatches: totalMatchedClients,
      agentsNotified: matchedAgentIds.length,
      listingAgentEmailResult,
      agentEmailResults
    };
    
  } catch (error) {
    console.error('❌ שגיאה בבדיקת תאמות שיתוף פעולה:', error);
    throw error;
  }
} 