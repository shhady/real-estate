/**
 * Utility functions for audio processing
 */

/**
 * Validates audio file format and size
 * @param {File} file - The audio file to validate
 * @param {number} maxSizeInMB - Maximum allowed size in MB (default 15MB)
 * @returns {Object} Validation result: { success: boolean, error?: string }
 */
export const validateAudioFile = (file, maxSizeInMB = 15) => {
  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  const validTypes = [
    'audio/mpeg', // MP3
    'audio/wav', // WAV
    'audio/mp4', // MP4 (may contain audio)
    'audio/m4a', // M4A (likely the best match for what you expect)
     'audio/x-m4a', // While valid, 'audio/m4a' is more standard
    'audio/ogg', // OGG
    'audio/webm', // WEBM (with audio)
    'audio/flac', // FLAC
    'audio/mpeg', // MPEG (can be audio)
    'audio/mpga', // MPGA
    'audio/oga', // OGA
  ];

  if (!file.type.startsWith('audio/')) {
    return { success: false, error: `Please upload a valid audio file (${validTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}).` };
  }

  if (!validTypes.includes(file.type)) {
    return { success: false, error: `Only ${validTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} files are allowed.` };
  }

  const maxSizeBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { success: false, error: `File size exceeds ${maxSizeInMB}MB limit.` };
  }

  return { success: true };
};

/**
 * Formats audio duration from seconds into MM:SS
 * @param {number} durationInSeconds
 * @returns {string} Formatted duration (e.g., "03:27")
 */
export const formatAudioDuration = (durationInSeconds) => {
  if (!durationInSeconds || isNaN(durationInSeconds)) {
    return '00:00';
  }

  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Extracts metadata from an audio file (browser only)
 * @param {File} file - Audio file to analyze
 * @returns {Promise<Object>} { duration, formattedDuration }
 */
export const extractAudioMetadata = (file) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.Audio || !window.URL) {
      return resolve({});
    }

    try {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);

      audio.addEventListener('loadedmetadata', () => {
        const metadata = {
          duration: audio.duration,
          formattedDuration: formatAudioDuration(audio.duration)
        };
        URL.revokeObjectURL(objectUrl);
        resolve(metadata);
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load audio metadata.'));
      });

      audio.src = objectUrl;
    } catch (error) {
      reject(error);
    }
  });
};
