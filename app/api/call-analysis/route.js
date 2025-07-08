import { NextResponse } from 'next/server';
import { mkdir, unlink } from 'fs/promises'; // Keep unlink for potential future temp files, mkdir for tmp
import path, { join } from 'path';
import { randomUUID } from 'crypto';
import axios from 'axios'; // Import axios for downloading
import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary SDK
import { transcribeAudio, analyzeTranscription } from '../../utils/aiAnalysis';
import logger from '../../utils/logger';

// Configure Cloudinary SDK (ensure environment variables are set)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: { bodyParser: false },
};

/**
 * Clean up local temporary file if created (currently not needed with this flow)
 * @param {string | null} filepath - Path of file to delete
 */
const cleanupLocalFile = async (filepath) => {
  if (filepath) {
    try {
      await unlink(filepath);
      logger.info(`Temporary local file deleted: ${filepath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logger.error(`Error deleting local file ${filepath}:`, error.message);
      }
    }
  }
};

/**
 * Downloads a file from a URL into a Buffer
 * @param {string} url - The URL to download from
 * @returns {Promise<Buffer>} - The downloaded file buffer
 */
const downloadFileToBuffer = async (url) => {
  try {
    logger.info(`Downloading file from Cloudinary URL: ${url}`);
    const response = await axios.get(url, {
      responseType: 'arraybuffer' // Important: Get response as ArrayBuffer
    });
    logger.info(`File downloaded successfully (${response.data.byteLength} bytes)`);
    return Buffer.from(response.data); // Convert ArrayBuffer to Node.js Buffer
  } catch (error) {
    logger.error(`Error downloading file from ${url}:`, error.response?.status, error.message);
    throw new Error(`Failed to download audio file from Cloudinary: ${error.message}`);
  }
};


/**
 * API POST handler for call analysis
 */
export async function POST(request) {
  logger.info('📞 POST /api/call-analysis started at ' + new Date().toISOString());

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out after 5 minutes')), 300000)
  );

  const processing = (async () => {
    // --- No local temp saving needed initially ---
    // const uploadDir = join(process.cwd(), 'tmp');
    // await mkdir(uploadDir, { recursive: true });

    // Parse incoming form data
    const formData = await request.formData();
    const clientName = formData.get('clientName')?.toString().trim();
    const phoneNumber = formData.get('phoneNumber')?.toString().trim();
    const audioFile = formData.get('audioFile');

    if (!clientName || !phoneNumber || !audioFile) {
      logger.warn('Missing required fields in call analysis request');
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Basic file validation
    const fileType = audioFile.type || '';
    logger.info('Uploaded audio file type: ' + fileType);
    if (!fileType.startsWith('audio/')) {
      logger.warn(`Invalid file type uploaded: ${fileType}`);
      return NextResponse.json({ error: 'Uploaded file is not a valid audio file.' }, { status: 400 });
    }

    const originalFilename = audioFile.name || 'audiofile';
    const fileUUID = randomUUID();
    let cloudinaryUrlToDownload = null;
    let whisperFilename = 'audio.tmp'; // Default filename for Whisper
    let cloudinaryPublicId = null;

    try {
      // Convert file blob/object to buffer for Cloudinary upload
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      logger.info(`Read uploaded file into buffer (${audioBuffer.length} bytes)`);

      // --- Cloudinary Upload & Conditional Conversion ---
      if (fileType === 'audio/x-m4a' || fileType === 'audio/m4a' || fileType === 'audio/mp4') {
        logger.info(`Detected ${fileType}. Uploading to Cloudinary with MP3 conversion...`);
        // Upload M4A/MP4 and convert to MP3 in Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({
            resource_type: 'video', // Use 'video' for audio processing features
            folder: 'call_recordings', // Optional: specify a folder
            public_id: fileUUID, // Use UUID for unique ID
            format: 'mp3', // Convert to MP3
            audio_codec: 'mp3', // Specify MP3 audio codec
          }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
          uploadStream.end(audioBuffer);
        });

        if (!uploadResult || !uploadResult.secure_url) {
           throw new Error('Cloudinary upload or conversion failed.');
        }

        cloudinaryUrlToDownload = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;
        whisperFilename = `${fileUUID}.mp3`; // Use MP3 extension for Whisper
        logger.info(`Cloudinary upload & conversion successful. MP3 URL: ${cloudinaryUrlToDownload}`);

      } else {
        logger.info(`Uploading original format (${fileType}) to Cloudinary...`);
        // Upload other supported formats (like MP3, WAV) directly
         const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({
            resource_type: 'video',
            folder: 'call_recordings',
            public_id: fileUUID,
            // Use original filename extension if needed (optional)
            // format: path.extname(originalFilename).substring(1)
          }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
          uploadStream.end(audioBuffer);
        });

        if (!uploadResult || !uploadResult.secure_url) {
           throw new Error('Cloudinary upload failed.');
        }

        cloudinaryUrlToDownload = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;
        // Use original extension (or fallback) for Whisper filename
        whisperFilename = fileUUID + (path.extname(originalFilename).toLowerCase() || '.tmp');
        logger.info(`Cloudinary upload successful. Original format URL: ${cloudinaryUrlToDownload}`);
      }
      // --- End Cloudinary Upload ---

      // --- Download from Cloudinary ---
      const audioData = await downloadFileToBuffer(cloudinaryUrlToDownload);
      if (!audioData) {
        logger.error('Failed to download audio file from Cloudinary');
        return NextResponse.json({ error: 'Failed to download audio file from Cloudinary' }, { status: 500 });
      }
      // --- End Download ---

      // --- Transcription Step ---
      let transcription = '';
      try {
        logger.info(`Starting transcription process with audio size: ${audioData.length} bytes`);
        transcription = await transcribeAudio({
          buffer: audioData,
          name: whisperFilename
        });
        logger.info(`Transcription successful: ${transcription.substring(0, 100)}...`);
      } catch (error) {
        logger.error('❌ Transcription failed:', error);
        transcription = `[Transcription failed: ${error.message}. Please check the audio file quality or format after potential conversion.]`;
        // Log specific OpenAI error status if available
         if (error.status) {
             logger.error(`OpenAI API returned status: ${error.status}`);
         }
        // Fallthrough to analysis with the error message
      }
      // --- End Transcription Step ---

      // --- Analysis Step ---
      let analysis = null;
      try {
        analysis = await analyzeTranscription(transcription);
        logger.info('✅ Analysis completed.');
      } catch (error) {
        logger.error('❌ Analysis failed:', error);
        // Don't cleanup Cloudinary file on analysis failure, maybe user wants it
        return NextResponse.json({ error: 'Failed to analyze transcription: ' + error.message }, { status: 500 });
      }
      // --- End Analysis Step ---

      // --- MongoDB saving is handled by the frontend via API calls ---
      logger.info('✅ Call analysis completed successfully. MongoDB saving handled by frontend.');

      // --- Success Response ---
      // Note: We are not deleting the Cloudinary file automatically here.
      // You might want to add logic later to delete files from Cloudinary if needed.
      logger.info('Call analysis processing completed successfully');
      return NextResponse.json({
        success: true,
        transcription,
        summary: analysis.summary,
        followUps: analysis.followUps,
        positives: analysis.positives,
        issues: analysis.issues,
        cloudinaryUrl: cloudinaryUrlToDownload, // Optionally return the URL
        cloudinaryPublicId: cloudinaryPublicId // Optionally return the ID
      });

    } catch (error) { // Catch errors from upload, download, or other steps
        logger.error('Processing error:', error);
        // Cleanup local file if it somehow exists (though unlikely with this flow)
        // await cleanupLocalFile(some_local_path_if_used);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred during processing.' }, { status: 500 });
    }
  })();

  // Race actual processing against timeout
  return Promise.race([timeout, processing]);
}