import { NextResponse } from 'next/server';
import { google } from 'googleapis';
// Import MongoDB client
import clientPromise from '../../lib/mongodb';
import { headers } from 'next/headers';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Get the host from headers to construct absolute URLs
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    // Validate the required fields
    if (!data.listing) {
      return NextResponse.json(
        { error: 'Missing listing data' },
        { status: 400 }
      );
    }
    
    console.log('Saving listing data:', data);
    
    // Extract the listing data
    const listing = data.listing;
    
    // Handle descriptions from either source
    let hebrewDescription = '';
    let arabicDescription = '';
    
    // Check for specific language descriptions first
    if (data.descriptionHE) {
      hebrewDescription = data.descriptionHE;
      console.log('Using specific Hebrew description');
    }
    
    if (data.descriptionAR) {
      arabicDescription = data.descriptionAR;
      console.log('Using specific Arabic description');
    }
    
    // Fall back to the description object if specific fields are not present
    if (!hebrewDescription && data.description && data.description.hebrew) {
      hebrewDescription = data.description.hebrew;
      console.log('Using Hebrew description from description object');
    }
    
    if (!arabicDescription && data.description && data.description.arabic) {
      arabicDescription = data.description.arabic;
      console.log('Using Arabic description from description object');
    }
    
    const mediaUrls = Array.isArray(data.mediaUrls) ? data.mediaUrls : [data.mediaUrls];
    
    // Format the date in ISO format
    const currentDate = new Date().toISOString();
    
    try {
      // Results tracking
      let sheetResult = false;
      let mongoResult = false;
      let listingId = null;
      let listingUrl = '';
      
      // First, save to MongoDB to get the ID
      if (process.env.MONGODB_URI) {
        try {
          const client = await clientPromise;
          const db = client.db();
          
          // Create a document to insert
          const doc = {
            url: data.mediaUrls && data.mediaUrls.length > 0 ? data.mediaUrls[0] : '',
            time: currentDate,
            agent: {
              id: listing.clientId || 'unknown',
              name: listing.agentName || ''
            },
            descriptionHE: hebrewDescription,
            descriptionAR: arabicDescription,
            title: listing.title || '',
            location: listing.location || '',
            type: listing.type || '',
            rooms: listing.rooms || '',
            size: listing.area || '',
            floor: listing.floor || '',
            street: '',
            images_video: Array.isArray(data.mediaUrls) ? data.mediaUrls : [data.mediaUrls || ''],
            price: listing.price || '',
            createdAt: new Date()
          };
          
          // Insert the document
          const result = await db.collection('listings').insertOne(doc);
          console.log('MongoDB insertion result:', result);
          
          mongoResult = result.acknowledged;
          
          // Get the MongoDB ID for the listing URL
          if (mongoResult && result.insertedId) {
            listingId = result.insertedId.toString();
            // Create absolute URL for the listing
            listingUrl = `${protocol}://${host}/listings/${listingId}`;
            console.log('Generated listing URL:', listingUrl);
          }
        } catch (mongoError) {
          console.error('MongoDB error:', mongoError);
        }
      }
      
      // Then, save to Google Sheets with the listing URL
      if (listingId) {
        sheetResult = await appendToGoogleSheet({
          url: listingUrl, // Now using the absolute listing URL
          mediaUrl: data.mediaUrls && data.mediaUrls.length > 0 ? data.mediaUrls[0] : '', // Keep original media URL for reference
          time: currentDate,
          idAndName: `${listing.clientId || 'unknown'} - ${listing.agentName || ''}`,
          descriptionHE: hebrewDescription,
          descriptionAR: arabicDescription,
          title: listing.title || '',
          location: listing.location || '',
          type: listing.type || '',
          rooms: listing.rooms || '',
          size: listing.area || '',
          floor: listing.floor || '',
          street: '',  // Add if available in your data
          imagesVideo: Array.isArray(data.mediaUrls) ? data.mediaUrls.join(', ') : data.mediaUrls || '',
          price: listing.price || ''
        });
      } else {
        // If MongoDB failed or not configured, fall back to using the media URL
        sheetResult = await appendToGoogleSheet({
          url: data.mediaUrls && data.mediaUrls.length > 0 ? data.mediaUrls[0] : '',
          mediaUrl: data.mediaUrls && data.mediaUrls.length > 0 ? data.mediaUrls[0] : '', // Same as URL in this case
          time: currentDate,
          idAndName: `${listing.clientId || 'unknown'} - ${listing.agentName || ''}`,
          descriptionHE: hebrewDescription,
          descriptionAR: arabicDescription,
          title: listing.title || '',
          location: listing.location || '',
          type: listing.type || '',
          rooms: listing.rooms || '',
          size: listing.area || '',
          floor: listing.floor || '',
          street: '',  // Add if available in your data
          imagesVideo: Array.isArray(data.mediaUrls) ? data.mediaUrls.join(', ') : data.mediaUrls || '',
          price: listing.price || ''
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Listing saved successfully',
        googleSheets: sheetResult ? 'Success' : 'Skipped',
        mongodb: mongoResult ? 'Success' : (process.env.MONGODB_URI ? 'Failed' : 'Not configured'),
        listingId: listingId || null,
        listingUrl: listingUrl || null
      });
      
    } catch (integrationError) {
      console.error('Error in integration:', integrationError);
      
      return NextResponse.json({
        success: false,
        error: 'Integration failure',
        details: integrationError.message
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error processing listing data:', error);
    
    return NextResponse.json(
      { error: 'Failed to save listing data', details: error.message },
      { status: 500 }
    );
  }
}

async function appendToGoogleSheet(rowData) {
  try {
    // Create auth client
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      null,
      // We need to replace the escaped newlines
      process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Make sure the data matches the exact order of the sheet headers:
    // URL | time | id+ name | descriptionHE | descriptionAR | title | Location | Type | Rooms | Size | Floor | Street | images/video | price
    const values = [
      [
        rowData.url,                  // URL (now contains the absolute listing URL)
        rowData.time,                 // time
        rowData.idAndName,            // id+ name
        rowData.descriptionHE,        // descriptionHE
        rowData.descriptionAR,        // descriptionAR
        rowData.title,                // title
        rowData.location,             // Location
        rowData.type,                 // Type
        rowData.rooms,                // Rooms
        rowData.size,                 // Size
        rowData.floor,                // Floor
        rowData.street,               // Street
        rowData.imagesVideo,          // images/video
        rowData.price,                // price
        rowData.mediaUrl              // Original media URL as an additional column
      ]
    ];
    
    // Append to the sheet - make sure to use the correct sheet name
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Listings!A1', // Make sure "Listings" is your sheet name
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: values
      }
    });
    
    console.log('Sheet update successful:', response.data);
    return true;
    
  } catch (error) {
    console.error('Error appending to Google Sheet:', error);
    return false;
  }
} 