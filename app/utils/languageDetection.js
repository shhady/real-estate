/**
 * Language detection utility
 * Identifies the language of text using basic heuristics
 */
import logger from './logger';

// Common words/patterns for different languages
const languagePatterns = {
  hebrew: {
    characters: /[\u0590-\u05FF]/,  // Hebrew Unicode range
    frequency: 0.1  // Threshold for detection
  },
  arabic: {
    characters: /[\u0600-\u06FF]/,  // Arabic Unicode range
    frequency: 0.1  // Threshold for detection
  },
  english: {
    // Common English words that are unlikely in other languages
    words: /\b(the|and|is|in|to|of|a|for|that|this|it|with|you|have|are)\b/gi,
    frequency: 0.05  // Threshold for detection
  }
};

/**
 * Detects the primary language of a text
 * @param {string} text - The text to analyze
 * @returns {string} - The detected language code: 'en', 'he', 'ar', or 'unknown'
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') {
    logger.warn('Invalid text provided for language detection');
    return 'unknown';
  }

  try {
    logger.info('Detecting language from text');
    
    // Clean the text
    const cleanText = text.trim();
    
    // Check for Hebrew characters
    const hebrewMatches = (cleanText.match(languagePatterns.hebrew.characters) || []).length;
    const hebrewFrequency = hebrewMatches / cleanText.length;
    if (hebrewFrequency > languagePatterns.hebrew.frequency) {
      logger.info('Detected Hebrew language');
      return 'he';
    }
    
    // Check for Arabic characters
    const arabicMatches = (cleanText.match(languagePatterns.arabic.characters) || []).length;
    const arabicFrequency = arabicMatches / cleanText.length;
    if (arabicFrequency > languagePatterns.arabic.frequency) {
      logger.info('Detected Arabic language');
      return 'ar';
    }
    
    // Check for English words
    const englishMatches = (cleanText.match(languagePatterns.english.words) || []).length;
    const words = cleanText.split(/\s+/).length;
    const englishFrequency = words > 0 ? englishMatches / words : 0;
    if (englishFrequency > languagePatterns.english.frequency) {
      logger.info('Detected English language');
      return 'en';
    }
    
    // If no specific pattern is strong enough, fall back to analyzing character sets
    // This is a simplistic fallback - in a production system, you might want to use a more robust library
    
    // Count character ranges
    let latinChars = 0;
    let hebrewChars = 0;
    let arabicChars = 0;
    
    for (let i = 0; i < cleanText.length; i++) {
      const code = cleanText.charCodeAt(i);
      if (code >= 65 && code <= 122) latinChars++; // A-Z, a-z
      if (code >= 0x0590 && code <= 0x05FF) hebrewChars++;
      if (code >= 0x0600 && code <= 0x06FF) arabicChars++;
    }
    
    // Determine dominant script
    const max = Math.max(latinChars, hebrewChars, arabicChars);
    if (max === latinChars) return 'en';
    if (max === hebrewChars) return 'he';
    if (max === arabicChars) return 'ar';
    
    // If nothing is clearly dominant
    logger.info('Unable to confidently detect language, defaulting to English');
    return 'en'; // Default to English
  } catch (error) {
    logger.error('Error during language detection:', error);
    return 'en'; // Default to English on error
  }
} 