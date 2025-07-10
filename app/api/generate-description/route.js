import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client with proper error handling
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  // We'll handle API calls with fallbacks if the client fails to initialize
}

export async function POST(request) {
  try {
    // Parse the request body
    const propertyData = await request.json();
    
    // Validate that required fields are present
    if (!propertyData.title || !propertyData.location || !propertyData.price || !propertyData.area) {
      return NextResponse.json(
        { error: 'Missing required property information' },
        { status: 400 }
      );
    }

    // Format property details for the prompt
    const propertyDetails = `
      Title: ${propertyData.title}
      Type: ${propertyData.type || 'property'}
      Location: ${propertyData.location}
      Area: ${propertyData.area} sqm
      Price: ${propertyData.price}
      ${propertyData.rooms ? `Rooms: ${propertyData.rooms}` : ''}
      ${propertyData.floor ? `Floor: ${propertyData.floor}` : ''}
      ${propertyData.notes ? `Notes: ${propertyData.notes}` : ''}
      Agent Name: ${propertyData.agentName || ''}
      Agent Phone: ${propertyData.agentPhone || ''}
    `;
    
    console.log('Generating descriptions for property:', propertyDetails);

    // Check if OpenAI client is properly initialized
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.warn('OpenAI client not available, using fallback descriptions');
      const fallbackDescriptions = generateBasicDescriptions(propertyData);
      return NextResponse.json({
        success: true,
        descriptions: fallbackDescriptions,
        note: 'Used fallback descriptions due to API configuration issues'
      });
    }

    // Craft the prompt for both Hebrew and Arabic descriptions
    const prompt = `
You are a professional real estate content assistant specializing in persuasive property listings.


Your job is to generate TWO short real estate post descriptions for the following listing for social media:
- One in **Hebrew**
- One in **Arabic**

🔒 RULES YOU MUST FOLLOW:
- If a field (like notes or title) is in another language, **translate it to match** the description language
- Use plain text only (no HTML or Markdown)
- Write in persuasive, emotionally appealing language suitable for Instagram or Facebook
- Limit each description to under **2200 characters**
- Use a few smart emojis like 🏡 📞 ✨ 🌟 💎 to boost appeal
- Include specific features and benefits: location, area, rooms, floor, parking, balcony, investment potential, etc.
- Always end with the agent name AND phone number (localized text!)
- Translate location names into the language of the description (e.g.,  الناصره ➜ الناصرة ➜ נצרת || נוף הגליל ➜ نوف هجليل || חיפה ➜ حيفا)
Use the exact format below and generate both blocks:

- Each description must be written 100% in the specified language — NO MIXED LANGUAGES (even phone number labels like "פרטים נוספים" or "لمزيد من التفاصيل" must be in the correct language)

Use ONE of these exact formats (do not change the order of information):

🏡 {{title}} ב{{location}}!

שטח: ${propertyData.area} מ"ר
${propertyData.rooms ? `- חדרים: ${propertyData.rooms}` : ''}
${propertyData.floor ? `- קומה: ${propertyData.floor}` : ''}

מחיר: ₪${propertyData.price}

[ADD COMPELLING SALES CONTENT HERE - highlight location benefits, property features, investment opportunity, unique selling points, etc. - be persuasive!]

${propertyData.notes || ''}

📞 לפרטים נוספים: ${propertyData.agentName || ''}, ${propertyData.agentPhone || 'PHONE NUMBER MISSING - YOU MUST INCLUDE THE PHONE NUMBER'}

—

🏡 {{title in Arabic}} في {{location in Arabic}}!

المساحة: {{area}} م²
${propertyData.rooms ? `- عدد الغرف: ${propertyData.rooms}` : ''}
${propertyData.floor ? `- الطابق: ${propertyData.floor}` : ''}

السعر: ₪${propertyData.price}

[ADD COMPELLING SALES CONTENT HERE IN ARABIC - highlight location benefits, property features, investment opportunity, unique selling points, etc. - be persuasive!]

${propertyData.notes ? '[TRANSLATE NOTES TO ARABIC]' : ''}

📞 لمزيد من التفاصيل: ${propertyData.agentName || ''}, ${propertyData.agentPhone || 'PHONE NUMBER MISSING - YOU MUST INCLUDE THE PHONE NUMBER'}

Property details:
${propertyDetails}

OR : 

🏡 {{title in Hebrew}} ב{{location in Hebrew}}!
שטח: ${propertyData.area} מ"ר${propertyData.rooms ? ` - חדרים: ${propertyData.rooms}` : ''}${propertyData.floor ? ` - קומה: ${propertyData.floor}` : ''}
מחיר: ₪${propertyData.price}

[✍️ Write a powerful, emotional Hebrew description that sells — include highlights of the location, unique features, potential returns, and why it's a great deal.]

${propertyData.notes ? 'הערות: ${propertyData.notes}' : ''}

📞 לפרטים נוספים: ${propertyData.agentName}, ${propertyData.agentPhone}

—

🏡 {{title in Arabic}} في {{location in Arabic}}!
المساحة: ${propertyData.area} م²${propertyData.rooms ? ` - عدد الغرف: ${propertyData.rooms}` : ''}${propertyData.floor ? ` - الطابق: ${propertyData.floor}` : ''}
السعر: ₪${propertyData.price}

[✍️ Write a powerful, emotional Arabic description that sells — include location benefits, property highlights, investment value, and why it’s ideal.]

${propertyData.notes ? 'ملاحظات: [TRANSLATE TO ARABIC]' : ''}

📞 لمزيد من التفاصيل: ${propertyData.agentName}, ${propertyData.agentPhone}

—

IMPORTANT: Both descriptions MUST include the agent's phone number at the end. The phone number is: ${propertyData.agentPhone || 'Not provided, but you must include a placeholder asking for it'}

🏁 NOTES:
-Respond with EXACTLY two descriptions only - first in Hebrew, then in Arabic. No other text. 
-Make sure to add compelling sales content about why someone should buy this property!
- You must translate mixed-language fields into the correct language block
- Only return the two description blocks — no extra explanation
- Both blocks must be under 2200 characters

`;

    try {
      // Call OpenAI API to generate descriptions with timeout
      console.log('Starting OpenAI API call...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
      
      const response = await Promise.race([
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1500,
          temperature: 0.7,
        }, {
          signal: controller.signal
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('OpenAI API timeout')), 25000)
        )
      ]);

      clearTimeout(timeoutId);
      console.log('OpenAI API call completed successfully');

      const generatedText = response.choices[0].message.content.trim();
      
      // Parse the generated text to separate Hebrew and Arabic descriptions
      const [hebrewDesc, arabicDesc] = parseDescriptions(generatedText);
      
      // Return the descriptions
      return NextResponse.json({
        success: true,
        descriptions: {
          hebrew: hebrewDesc.trim(),
          arabic: arabicDesc.trim()
        }
      });
      
    } catch (aiError) {
      console.error('Error calling AI service:', aiError);
      console.error('AI Error details:', {
        name: aiError.name,
        message: aiError.message,
        code: aiError.code
      });
      
      // Check if it's a timeout error
      if (aiError.name === 'AbortError' || aiError.message?.includes('timeout')) {
        console.warn('OpenAI API timeout, using fallback descriptions');
      }
      
      // Fall back to basic template if AI service fails
      const basicDescriptions = generateBasicDescriptions(propertyData);
      
      return NextResponse.json({
        success: true,
        descriptions: basicDescriptions,
        note: 'Used fallback descriptions due to AI service error'
      });
    }
    
  } catch (error) {
    console.error('Error generating property descriptions:', error);
    return NextResponse.json(
      { error: 'Failed to generate property descriptions', details: error.message },
      { status: 500 }
    );
  }
}

// Function to parse the AI response and extract Hebrew and Arabic descriptions
function parseDescriptions(text) {
  // Split by the separator between languages
  const parts = text.split('—').map(part => part.trim());
  
  // If we don't get two clear parts, handle it
  if (parts.length < 2) {
    // Try to find other potential separators
    if (text.includes('-----')) {
      return text.split('-----').map(part => part.trim());
    }
    
    // Look for clear language transitions (Hebrew to Arabic script)
    const hebrewPart = text.match(/[\u0590-\u05FF\s\d!@#$%^&*(),.?":{}|<>]+/g)?.join('') || '';
    const arabicPart = text.match(/[\u0600-\u06FF\s\d!@#$%^&*(),.?":{}|<>]+/g)?.join('') || '';
    
    if (hebrewPart && arabicPart) {
      return [hebrewPart, arabicPart];
    }
    
    // If all else fails, just split in half (not ideal)
    const midpoint = Math.floor(text.length / 2);
    return [text.substring(0, midpoint), text.substring(midpoint)];
  }
  
  return parts;
}

// Fallback function to generate basic descriptions
function generateBasicDescriptions(propertyData) {
  // Ensure phone number is available or use a placeholder
  const phoneNumber = propertyData.agentPhone || '050-XXX-XXXX (יש לעדכן)';
  const agentName = propertyData.agentName || 'סוכן הנדל"ן';
  
  // Basic Hebrew template with enhanced sales content
  const hebrewDesc = `🏡 ${propertyData.title} ב${propertyData.location}!

שטח: ${propertyData.area} מ"ר
${propertyData.rooms ? `- חדרים: ${propertyData.rooms}` : ''}
${propertyData.floor ? `- קומה: ${propertyData.floor}` : ''}

מחיר: ₪${propertyData.price}

✨ הזדמנות נדירה! נכס מיוחד במיקום מבוקש. מושלם למשפחות המחפשות איכות חיים גבוהה עם נגישות מעולה לכל השירותים החיוניים. עיצוב מודרני ותכנון חכם המנצל כל פינה.

מחפשים בית חלומות? הנכס הזה מציע את התמהיל המושלם של מיקום, איכות וערך! אל תפספסו!

${propertyData.notes || ''}

📞 לפרטים נוספים: ${agentName}, ${phoneNumber}`;

  // Basic Arabic template with enhanced sales content
  const arabicDesc = `🏡 ${getArabicTitle(propertyData.type)} في ${propertyData.location}!

المساحة: ${propertyData.area} م²
${propertyData.rooms ? `- عدد الغرف: ${propertyData.rooms}` : ''}
${propertyData.floor ? `- الطابق: ${propertyData.floor}` : ''}

السعر: ₪${propertyData.price}

✨ فرصة نادرة! عقار متميز في موقع مرغوب. مثالي للعائلات التي تبحث عن جودة حياة عالية مع سهولة الوصول إلى جميع الخدمات الأساسية. تصميم عصري وتخطيط ذكي يستفيد من كل ركن.

هل تبحث عن منزل أحلامك؟ يقدم هذا العقار المزيج المثالي من الموقع والجودة والقيمة! لا تفوت هذه الفرصة!

${propertyData.notes ? translateNotesToArabic(propertyData.notes, propertyData.type) : ''}

📞 لمزيد من التفاصيل: ${agentName}, ${phoneNumber}`;

  return {
    hebrew: hebrewDesc,
    arabic: arabicDesc
  };
}

// Helper function to provide basic Arabic translation of notes based on property type
function translateNotesToArabic(notes, propertyType) {
  if (!notes || notes.length < 3) {
    return getArabicNotes(propertyType);
  }
  
  // Very simple translation based on property type with the note included
  const prefix = propertyType === 'villa' ? 'فيلا فاخرة تشمل: ' :
                propertyType === 'apartment' ? 'شقة جميلة تشمل: ' :
                propertyType === 'house' ? 'منزل رائع يشمل: ' :
                propertyType === 'land' ? 'قطعة أرض تتميز بـ: ' :
                'عقار مميز يشمل: ';
                
  return `${prefix}${notes}`;
}

// Helper for Arabic title based on property type
function getArabicTitle(propertyType) {
  const types = {
    'villa': 'فيلا للبيع',
    'apartment': 'شقة للبيع',
    'house': 'منزل للبيع',
    'store': 'متجر للبيع',
    'office': 'مكتب للبيع',
    'land': 'أرض للبيع',
    'warehouse': 'مستودع للبيع'
  };
  
  return types[propertyType] || 'عقار للبيع';
}

// Helper for Arabic notes
function getArabicNotes(propertyType) {
  const notes = {
    'villa': 'فيلا فاخرة في موقع ممتاز.',
    'apartment': 'شقة جميلة في موقع مميز.',
    'house': 'منزل رائع في منطقة هادئة.',
    'store': 'متجر في موقع تجاري ممتاز.',
    'office': 'مكتب حديث في منطقة أعمال نشطة.',
    'land': 'قطعة أرض بموقع استراتيجي.',
    'warehouse': 'مستودع واسع مناسب للأعمال التجارية.'
  };
  
  return notes[propertyType] || 'عقار مميز بموقع رائع.';
}