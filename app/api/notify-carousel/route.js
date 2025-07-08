import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the request body
    const requestData = await request.json();
    
    // Extract the basic required fields
    const { 
      mediaUrls, 
      mediaTypes, 
      overlay, 
      clientId, 
      contentType, 
      isCarousel,
      listing,
      description,
      languageChoice,
      descriptionHE, 
      descriptionAR,
      videoUrl
    } = requestData;
    
    // Check for image collection content type (formerly video_from_photos)
    const isImageCollection = contentType === 'image_collection';
    
    if (!mediaUrls || !Array.isArray(mediaUrls) || mediaUrls.length === 0 || 
        !mediaTypes || !Array.isArray(mediaTypes) || mediaTypes.length === 0 || 
        typeof overlay !== 'boolean' || !clientId) {
      console.error('Missing required parameters:', { 
        mediaUrls: !!mediaUrls && Array.isArray(mediaUrls) && mediaUrls.length > 0, 
        mediaTypes: !!mediaTypes && Array.isArray(mediaTypes) && mediaTypes.length > 0, 
        overlay: typeof overlay, 
        clientId: !!clientId,
        contentType
      });
      
      return NextResponse.json(
        { 
          error: 'Missing required parameters', 
          details: 'Please ensure mediaUrls, mediaTypes, overlay, and clientId are provided',
          receivedContentType: contentType,
          validation: {
            mediaUrls: !!mediaUrls && Array.isArray(mediaUrls) && mediaUrls.length > 0,
            mediaTypes: !!mediaTypes && Array.isArray(mediaTypes) && mediaTypes.length > 0, 
            overlay: typeof overlay === 'boolean',
            clientId: !!clientId
          }
        },
        { status: 400 }
      );
    }

    // Prepare the webhook payload for carousel or image collection
    const webhookPayload = {
      clientId,
      mediaUrls,
      mediaTypes,
      overlay,
      triggerSource: 'nextjs',
      contentType: contentType || 'Carousel',
      isCarousel: true
    };
    
    // Add videoUrl if provided (important for video-from-photos mode)
    if (videoUrl) {
      webhookPayload.videoUrl = videoUrl;
    }
    
    // Add listing data if provided
    if (listing) {
      webhookPayload.listing = listing;
    }
    
    // Handle descriptions - avoid duplicating data
    // First check if we have specific Hebrew/Arabic descriptions
    if (descriptionHE || descriptionAR) {
      // If specific language descriptions are provided, use them
      if (descriptionHE) webhookPayload.descriptionHE = descriptionHE;
      if (descriptionAR) webhookPayload.descriptionAR = descriptionAR;
      
      // Add language choice if specific descriptions are provided
      if (languageChoice) webhookPayload.languageChoice = languageChoice;
      
      console.log('Using specific language descriptions (HE/AR)');
    } 
    // Only use the generic description object if specific descriptions aren't available
    else if (description) {
      console.log('Using generic description object');
      webhookPayload.description = description;
      webhookPayload.languageChoice = languageChoice || 'both';
    }

    // Log the data being processed with more details about content type
    console.log('Processing notification:', {
      numberOfItems: mediaUrls.length,
      mediaTypes,
      contentType: contentType || 'Carousel',
      receivedContentType: contentType,
      isPhotosVideo: contentType === 'photosVideo',
      isCarousel: contentType === 'Carousel',
      hasVideoUrl: !!videoUrl,
      overlay,
      hasListing: !!listing,
      hasSpecificDescriptions: !!(descriptionHE || descriptionAR),
      hasGenericDescription: !!description
    });

    try {
      // Send the webhook
      const webhookUrl = process.env.WEBHOOK_URL;
      
      if (!webhookUrl) {
        console.warn('No webhook URL configured, skipping webhook notification');
        return NextResponse.json({
          success: true,
          message: 'Content processed successfully (webhook notification skipped - no URL configured)',
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
          message: 'Content processed successfully but webhook notification failed',
          webhookError: `Failed with status ${response.status}`,
          mediaUrls: mediaUrls.slice(0, 3) // Include first few URLs in response
        });
      }

      // Return success
      return NextResponse.json({
        success: true,
        message: contentType === 'photosVideo' 
          ? 'Video from photos processed successfully' 
          : 'Carousel notification sent successfully',
        itemCount: mediaUrls.length
      });
    } catch (webhookError) {
      // If webhook fails, we still want to return success for the upload
      console.error('Error sending webhook:', webhookError);
      return NextResponse.json({
        success: true,
        message: 'Content processed successfully but webhook notification failed',
        webhookError: webhookError.message,
        mediaUrls: mediaUrls.slice(0, 3) // Include first few URLs in response
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