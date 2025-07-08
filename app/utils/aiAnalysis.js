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
 * Transcribes an audio file using OpenAI's Whisper API
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
      // Use OpenAI API with a file path
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
      });
      
      logger.info('Transcription completed successfully');
      
      // Clean up the temporary file
      fs.unlinkSync(tempFilePath);
      logger.info(`Removed temporary file: ${tempFilePath}`);
      
      return transcription.text;
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
 * Analyzes a transcription using OpenAI's GPT-4o model
 * @param {string} transcription - The text to analyze
 * @returns {Promise<Object>} - The analysis results
 */
export async function analyzeTranscription(transcription) {
  try {
    logger.info('Starting analysis of transcription');
    
    // Detect the language of the transcription
    const language = detectLanguage(transcription);
    logger.info(`Detected language: ${language}`);
    
    const systemMessage = `
      You are an expert call analyzer for real estate agents. Your job is to analyze a call transcription and provide:
      1. A concise summary of the call (max 150 words)
      2. Key follow-up actions the agent should take
      3. Positive aspects of the call
      4. Issues or areas for improvement
      
      Match your response language to the transcription language.
      
      Respond ONLY in this JSON format:
      {
        "summary": "brief summary of the call",
        "followUps": ["action 1", "action 2", ...],
        "positives": ["positive aspect 1", "positive aspect 2", ...],
        "issues": ["issue 1", "issue 2", ...]
      }
    `;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: transcription }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    logger.info('Analysis completed successfully');
    
    // Parse the response and return
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    logger.error('Error analyzing transcription:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}
