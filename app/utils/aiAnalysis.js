import OpenAI from 'openai';
import logger from './logger';
import { detectLanguage } from './languageDetection';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';

// Initialize OpenAI client with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribes an audio file using OpenAI's Whisper API with automatic language detection
 * @param {Object} fileData - Object containing file data
 * @param {Buffer} fileData.buffer - The audio file buffer
 * @param {string} fileData.name - The filename for the audio
 * @returns {Promise<string>} - The transcription text
 */
export async function transcribeAudio(fileData) {
  try {
    logger.info(`Starting transcription for audio file: ${fileData.name}`);
    
    // Log file size for debugging
    logger.info(`Audio file size: ${fileData.buffer.length} bytes`);
    
    // Create a temporary file path - use system temp directory for serverless environments
    const isServerless = process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME;
    const tmpDir = isServerless ? os.tmpdir() : path.join(process.cwd(), 'tmp');
    
    // Only create directory if it's local development (not serverless)
    if (!isServerless) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tmpDir, `${randomUUID()}-${fileData.name}`);
    
    // Write the buffer to a temporary file
    try {
      fs.writeFileSync(tempFilePath, fileData.buffer);
      logger.info(`Saved audio data to temporary file: ${tempFilePath}`);
    } catch (writeError) {
      logger.error(`Failed to write temporary file: ${writeError.message}`);
      throw new Error(`Failed to create temporary file: ${writeError.message}`);
    }
    
    try {
      // Use OpenAI API with automatic language detection
      logger.info('Starting automatic language detection with Whisper...');
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
        // No language parameter - let Whisper auto-detect
        response_format: 'text'
      });
      
      logger.info('Transcription completed successfully');
      logger.info(`Raw transcription preview: ${transcription.substring(0, 100)}...`);
      
      // Detect language from the transcribed text for validation and logging
      const detectedLanguage = detectLanguage(transcription);
      logger.info(`Language detected from transcribed text: ${detectedLanguage}`);
      
      // Clean up the temporary file
      fs.unlinkSync(tempFilePath);
      logger.info(`Removed temporary file: ${tempFilePath}`);
      
      return transcription;
    } catch (error) {
      // Make sure we clean up the temporary file even if transcription fails
      try {
        fs.unlinkSync(tempFilePath);
        logger.info(`Removed temporary file after error: ${tempFilePath}`);
      } catch (cleanupError) {
        logger.warn(`Failed to clean up temporary file: ${cleanupError.message}`);
      }
      
      throw error;
    }
  } catch (error) {
    logger.error('Error transcribing audio file:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

/**
 * Analyzes and enhances a transcription using OpenAI's GPT-4 model
 * Formats with speaker labels, cleans language mix, and extracts structured data
 * @param {string} transcription - The raw transcription text to analyze
 * @returns {Promise<Object>} - Enhanced analysis results with structured data
 */
export async function analyzeTranscription(transcription) {
  try {
    logger.info('Starting enhanced analysis of transcription');
    
    // Detect the language of the transcription for context
    const detectedLanguage = detectLanguage(transcription);
    logger.info(`Detected language for analysis: ${detectedLanguage}`);
    
    // Create language-aware system message
    const getLanguageInstructions = (lang) => {
      switch (lang) {
        case 'ar':
          return 'The conversation is primarily in Arabic. Clean up any Hebrew/Arabic language mixing common in Middle Eastern real estate. WRITE ALL ANALYSIS (summary, followUps, positives, negatives, improvementPoints, issues) IN ARABIC.';
        case 'he':
          return 'The conversation is primarily in Hebrew. Clean up any Hebrew/Arabic language mixing common in Israeli real estate. WRITE ALL ANALYSIS (summary, followUps, positives, negatives, improvementPoints, issues) IN HEBREW.';
        case 'en':
          return 'The conversation is in English. Maintain professional real estate terminology. WRITE ALL ANALYSIS (summary, followUps, positives, negatives, improvementPoints, issues) IN ENGLISH.';
        default:
          return 'Detect the conversation language and clean up any language mixing. Common in Middle Eastern real estate are Hebrew/Arabic mixes. WRITE ALL ANALYSIS IN THE SAME LANGUAGE AS THE CONVERSATION - DO NOT TRANSLATE TO ENGLISH.';
      }
    };
    
    const systemMessage = `You are an AI call analysis assistant. Your goal is to process real estate calls and output:

1. A clean, structured transcription labeled with Speaker 1: and Speaker 2:
2. Extracted metadata for intent, location, and property details
3. Analysis including summary, follow-ups, positives, and issues

CRITICAL LANGUAGE REQUIREMENT:
${getLanguageInstructions(detectedLanguage)}
- ALL ANALYSIS FIELDS (summary, followUps, positives, negatives, improvementPoints, issues) MUST be written in the SAME LANGUAGE as the conversation
- If the conversation is in Arabic, write ALL analysis in Arabic
- If the conversation is in Hebrew, write ALL analysis in Hebrew  
- If the conversation is in English, write ALL analysis in English
- DO NOT translate the analysis to English - keep it in the original conversation language
- The transcription should also maintain the original language with proper formatting

IMPORTANT INSTRUCTIONS:
- Format the transcription with clear "Speaker 1:" and "Speaker 2:" labels
- For example:
  - If "قرض" is mentioned but it's clear from context the speaker is referring to land, rewrite it as "أرض"
  - If "سيارة" or unrelated words are mentioned in a context describing land size, area, or location, assume it's a mistake and correct it.
  - If "أزور" is misheard but refers to a neighborhood or road in Israel, correct it accordingly
  - Fix dialectal errors and broken sentence structures
- Maintain conversational tone, but correct clear misrecognitions
- Add proper punctuation and sentence structure
- Extract structured property information accurately
- If multiple languages are detected, use the primary language for ALL analysis fields
- Format the transcription with clear "Speaker 1:" and "Speaker 2:" labels
- Fix recognition errors based on real estate context

SUMMARY REQUIREMENTS:
Create a comprehensive, detailed summary (150-200 words) IN THE SAME LANGUAGE AS THE CONVERSATION that includes:
- Specific property details discussed (exact location, size, features)
- Price negotiations and financial terms mentioned
- Client's specific needs, requirements, and preferences
- Timeline discussions (when they want to buy/sell, move-in dates)
- Key concerns, questions, or objections raised
- Decision-making status and next steps
- Market context or comparative information mentioned
- Any unique selling points or property advantages discussed
- Financing or payment method discussions
- Contact preferences and follow-up arrangements

Make the summary actionable and specific, not generic. Include actual numbers, locations, and concrete details mentioned in the conversation.

ANALYSIS REQUIREMENTS (ALL IN ORIGINAL CONVERSATION LANGUAGE):
- POSITIVES: Identify what went well in the call (good rapport, clear communication, client engagement)
- NEGATIVES: Identify what didn't go well (missed opportunities, poor communication, client confusion)
- IMPROVEMENT POINTS: Suggest specific ways to improve future calls (better questions, clearer explanations)
- FOLLOW-UPS: Specific actionable next steps with timelines
- PRE-APPROVAL STATUS: Check if client mentions having "אישור עקרוני" or "אישור משכנתה" (mortgage pre-approval) - set to true if mentioned, false if explicitly stated they don't have it, null if not discussed

Respond ONLY in this JSON format:
{
  "transcription": "Speaker 1: ... Speaker 2: ... (formatted with speaker labels)",
  "summary": "comprehensive detailed summary with specific information and actionable insights (200-300 words)",
  "followUps": ["specific actionable follow-up with timeline", "detailed next step with context", ...],
  "positives": ["specific positive aspect with context", "detailed strength of the interaction", ...],
  "negatives": ["specific negative aspect that didn't go well", "communication issues or missed opportunities", ...],
  "improvementPoints": ["specific way to improve future calls", "better approach or technique to use", ...],
  "issues": ["specific concern with suggested resolution", "detailed problem with context", ...],
  "intent": "buyer|seller|unknown",
  "location": "specific city, neighborhood, or area name",
  "propertyType": "apartment|house|commercial|land|other",
  "rooms": 0,
  "area": 0,
  "price": 0,
  "condition": "new|good|needs renovation|poor",
  "floor": 0,
  "parking": true|false|null,
  "balcony": true|false|null,
  "propertyNotes": "detailed notes about property features, restrictions, or special conditions",
  "preApproval": true|false|null
}
`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `Here's the transcription to process:\n\n${transcription}` }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    logger.info('Enhanced analysis completed successfully');
    
    // Parse the response and return
    const result = JSON.parse(completion.choices[0].message.content);
    
    // Log the analysis results for debugging
    logger.info(`Analysis results - Intent: ${result.intent}, Language context: ${detectedLanguage}`);
    
    // Ensure all required fields are present with defaults
    return {
      transcription: result.transcription || transcription,
      summary: result.summary || 'No summary available',
      followUps: result.followUps || [],
      positives: result.positives || [],
      negatives: result.negatives || [],
      improvementPoints: result.improvementPoints || [],
      issues: result.issues || [],
      intent: result.intent || 'unknown',
      location: result.location || '',
      propertyType: result.propertyType || '',
      rooms: result.rooms || null,
      area: result.area || null,
      price: result.price || null,
      condition: result.condition || '',
      floor: result.floor || null,
      parking: result.parking,
      balcony: result.balcony,
      propertyNotes: result.propertyNotes || '',
      preApproval: result.preApproval || null
    };
  } catch (error) {
    logger.error('Error in enhanced analysis:', error);
    throw new Error(`Enhanced analysis failed: ${error.message}`);
  }
}
