import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the request body
    const requestData = await request.json();
    
    // Extract the basic required fields
    const { 
      mediaUrl, 
      mediaUrls,
      mediaType, 
      mediaTypes,
      overlay, 
      clientId, 
      contentType,
      listing,
      description,
      languageChoice,
      videoUrl
    } = requestData;
    
    // Handle both single media and arrays from carousel that might be sent here
    const finalMediaUrl = mediaUrl || (mediaUrls && mediaUrls.length ? mediaUrls[0] : null);
    const finalMediaType = mediaType || (mediaTypes && mediaTypes.length ? mediaTypes[0] : null);
    
    // Validate that the required parameters are provided
    if (!finalMediaUrl || !finalMediaType || typeof overlay !== 'boolean' || !clientId) {
      console.error('Missing required parameters:', { 
        finalMediaUrl: !!finalMediaUrl, 
        finalMediaType: !!finalMediaType, 
        overlay: typeof overlay, 
        clientId: !!clientId
      });
      
      return NextResponse.json(
        { error: 'Missing required parameters', details: 'Please ensure mediaUrl, mediaType, overlay, and clientId are provided' },
        { status: 400 }
      );
    }

    // Prepare the webhook payload
    const webhookPayload = {
      clientId,
      mediaUrl: finalMediaUrl,
      mediaType: finalMediaType,
      overlay,
      triggerSource: 'nextjs'
    };

    // Add contentType if provided
    if (contentType) {
      webhookPayload.contentType = contentType;
    }
    
    // Add videoUrl if provided
    if (videoUrl) {
      webhookPayload.videoUrl = videoUrl;
    }
    
    // Add listing data if provided
    if (listing) {
      webhookPayload.listing = listing;
    }
    
    // Add description data if provided
    if (description) {
      webhookPayload.description = description;
      webhookPayload.languageChoice = languageChoice || 'both';
    }

    // Log the data being processed
    console.log('Processing upload notification:', {
      mediaUrl: finalMediaUrl.substring(0, 50) + '...',
      mediaType: finalMediaType,
      contentType: contentType || 'none',
      hasVideoUrl: !!videoUrl,
      overlay,
      hasListing: !!listing,
      hasDescription: !!description
    });

    try {
      // Send the webhook
      const webhookUrl = process.env.WEBHOOK_URL;
      
      if (!webhookUrl) {
        console.warn('No webhook URL configured, skipping webhook notification');
        return NextResponse.json({
          success: true,
          message: 'Upload processed successfully (webhook notification skipped - no URL configured)',
          warning: 'Webhook URL not configured'
        });
      }
      
      console.log('Sending webhook to:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        console.error(`Webhook request failed with status: ${response.status}`);
        // Don't throw an error, just report it
        return NextResponse.json({
          success: true,
          message: 'Upload processed successfully but webhook notification failed',
          webhookError: `Failed with status ${response.status}`,
          mediaUrl: finalMediaUrl
        });
      }

      // Return success
      return NextResponse.json({
        success: true,
        message: 'Upload notification sent successfully',
        mediaUrl: finalMediaUrl
      });
    } catch (webhookError) {
      // If webhook fails, we still want to return success for the upload
      console.error('Error sending webhook:', webhookError);
      return NextResponse.json({
        success: true,
        message: 'Upload processed successfully but webhook notification failed',
        webhookError: webhookError.message,
        mediaUrl: finalMediaUrl
      });
    }
  } catch (error) {
    console.error('Error processing notification:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process notification', 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 