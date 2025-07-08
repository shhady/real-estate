/**
 * Google Sheets integration utilities
 */
import { google } from 'googleapis';
import logger from './logger';

/**
 * Initializes Google Sheets API client
 * @returns {Promise<Object>} Google Sheets API client
 */
export const initSheetsClient = async () => {
  try {
    // Initialize auth - using service account
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
  } catch (error) {
    logger.error('Error initializing Google Sheets client:', error);
    throw new Error(`Google Sheets initialization failed: ${error.message}`);
  }
};

/**
 * Appends a row to a Google Sheet
 * @param {Object} data - Data to append to the sheet
 * @param {string} spreadsheetId - Google Sheet ID
 * @param {string} range - Sheet range (e.g., 'Sheet1!A:D')
 * @returns {Promise<Object>} Google Sheets API response
 */
export const appendToSheet = async (data, spreadsheetId, range) => {
  try {
    const sheets = await initSheetsClient();
    
    // Format the values for Google Sheets
    const values = [
      Object.values(data)
    ];
    
    // Append to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values,
      },
    });
    
    return response.data;
  } catch (error) {
    logger.error('Error appending to Google Sheet:', error);
    throw new Error(`Google Sheets operation failed: ${error.message}`);
  }
};

/**
 * Gets sheet metadata including title and structure
 * @param {string} spreadsheetId - Google Sheet ID
 * @returns {Promise<Object>} Sheet metadata
 */
export const getSheetMetadata = async (spreadsheetId) => {
  try {
    const sheets = await initSheetsClient();
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });
    
    return response.data;
  } catch (error) {
    logger.error('Error getting sheet metadata:', error);
    throw new Error(`Failed to get sheet metadata: ${error.message}`);
  }
};

/**
 * Adds a new sheet to the spreadsheet if it doesn't exist
 * @param {string} spreadsheetId - Google Sheet ID
 * @param {string} sheetTitle - Title for the new sheet
 * @returns {Promise<Object>} Response data
 */
export const createSheetIfNotExists = async (spreadsheetId, sheetTitle) => {
  try {
    const sheets = await initSheetsClient();
    
    // First, check if the sheet already exists
    const metadata = await getSheetMetadata(spreadsheetId);
    const existingSheet = metadata.sheets.find(
      sheet => sheet.properties.title === sheetTitle
    );
    
    if (existingSheet) {
      logger.info(`Sheet "${sheetTitle}" already exists`);
      return { 
        success: true, 
        message: 'Sheet already exists',
        sheetId: existingSheet.properties.sheetId
      };
    }
    
    logger.info(`Creating new sheet "${sheetTitle}"`);
    // If sheet doesn't exist, create it
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetTitle,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 26
                }
              }
            }
          }
        ]
      }
    });
    
    // Get the ID of the newly created sheet
    const newSheetId = response.data.replies[0].addSheet.properties.sheetId;
    
    // Add headers to the new sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetTitle}!A1:D1`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [['Client Name', 'Phone Number', 'Call Summary', 'Timestamp']]
      }
    });
    
    logger.info(`Sheet "${sheetTitle}" created successfully with headers`);
    return { 
      success: true, 
      message: 'Sheet created successfully',
      sheetId: newSheetId
    };
  } catch (error) {
    logger.error('Error creating sheet:', error);
    throw new Error(`Failed to create sheet: ${error.message}`);
  }
};

/**
 * Saves call analysis data to Google Sheets
 * @param {Object} data - Call analysis data object with clientName, phoneNumber, summary
 * @returns {Promise<Object>} Result of the operation
 */
export const saveCallAnalysisToSheets = async (data) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const hasCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS && 
                           process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    // If no Google Sheets credentials, log data and return mock success
    if (!hasCredentials) {
      logger.warn('Google Sheets credentials not configured. Logging data instead of saving to sheets.');
      logger.info('Would have saved call analysis data:', {
        clientName: data.clientName,
        phoneNumber: data.phoneNumber,
        summary: data.summary ? data.summary.substring(0, 100) + '...' : 'No summary',
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Mock data saved (Google Sheets not configured)',
        mock: true
      };
    }
    
    const sheetTitle = 'CallAnalysis';
    logger.info(`Preparing to save call analysis for ${data.clientName} to sheet "${sheetTitle}"`);
    
    // Ensure the CallAnalysis sheet exists
    await createSheetIfNotExists(spreadsheetId, sheetTitle);
    
    // Prepare the data row
    const rowData = {
      clientName: data.clientName,
      phoneNumber: data.phoneNumber,
      summary: data.summary,
      timestamp: new Date().toISOString()
    };
    
    // Append the data
    const result = await appendToSheet(
      rowData,
      spreadsheetId,
      `${sheetTitle}!A:D`
    );
    
    logger.info(`Successfully saved call analysis data to row ${result.updates.updatedRange}`);
    return {
      success: true,
      message: 'Data saved to Google Sheets',
      rowNumber: result.updates.updatedRows
    };
  } catch (error) {
    logger.error('Error saving call analysis to Google Sheets:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Save call analysis to Contacts sheet
/**
 * Appends call analysis data to the Contacts sheet in Google Sheets
 * @param {Object} analysisData - Object containing client name, phone number, summary, followUps, positives, issues
 * @returns {Promise<boolean>} - True if operation succeeds, false otherwise
 */
export const appendCallAnalysisToGoogleSheet = async (analysisData) => {
  try {
    // Basic validation of input data
    if (!analysisData || !analysisData.clientName || !analysisData.phoneNumber || !analysisData.summary) {
      logger.error('Missing required fields for call analysis data:', analysisData);
      return false;
    }
    
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const hasCredentials = process.env.GOOGLE_SHEETS_CLIENT_EMAIL && 
                          process.env.GOOGLE_SHEETS_PRIVATE_KEY && 
                          process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    // If no Google Sheets credentials, log data and return false
    if (!hasCredentials) {
      logger.warn('Google Sheets credentials not configured for Contacts sheet');
      logger.info('Would have saved detailed call analysis:', {
        clientName: analysisData.clientName,
        phoneNumber: analysisData.phoneNumber,
        summary: analysisData.summary ? analysisData.summary.substring(0, 100) + '...' : 'No summary',
        followUps: Array.isArray(analysisData.followUps) ? analysisData.followUps.join(' | ') : '',
        positives: Array.isArray(analysisData.positives) ? analysisData.positives.join(' | ') : '',
        issues: Array.isArray(analysisData.issues) ? analysisData.issues.join(' | ') : '',
        timestamp: new Date().toISOString()
      });
      
      return false;
    }
    
    const sheetTitle = 'Contacts';
    logger.info(`Preparing to append call analysis for ${analysisData.clientName} to "${sheetTitle}" sheet`);
    
    // Initialize auth - using service account with environment variables
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // First, check if the Contacts sheet exists
    try {
      const metadata = await sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: false,
      });
      
      const existingSheet = metadata.data.sheets.find(
        sheet => sheet.properties.title === sheetTitle
      );
      
      // If sheet doesn't exist, create it with headers
      if (!existingSheet) {
        logger.info(`Creating ${sheetTitle} sheet...`);
        
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetTitle,
                    gridProperties: {
                      rowCount: 1000,
                      columnCount: 7
                    }
                  }
                }
              }
            ]
          }
        });
        
        // Add headers
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetTitle}!A1:G1`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [['Client Name', 'Phone Number', 'Summary', 'Follow-ups', 'Positives', 'Issues', 'Timestamp']]
          }
        });
        
        logger.info(`${sheetTitle} sheet created with headers`);
      }
    } catch (error) {
      logger.error(`Error checking/creating ${sheetTitle} sheet:`, error);
      return false;
    }
    
    // Join arrays with pipe separator
    const followUpsString = Array.isArray(analysisData.followUps) 
      ? analysisData.followUps.join(' | ') 
      : '';
      
    const positivesString = Array.isArray(analysisData.positives) 
      ? analysisData.positives.join(' | ') 
      : '';
      
    const issuesString = Array.isArray(analysisData.issues) 
      ? analysisData.issues.join(' | ') 
      : '';
    
    // Current timestamp in ISO format
    const timestamp = new Date().toISOString();
    
    // Prepare the row data in specified order
    const values = [
      [
        analysisData.clientName, 
        analysisData.phoneNumber, 
        analysisData.summary,
        followUpsString,
        positivesString,
        issuesString,
        timestamp
      ]
    ];
    
    // Append to the Contacts sheet
    try {
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetTitle}!A1`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values
        }
      });
      
      logger.info(`Call analysis data appended to ${sheetTitle} sheet successfully at ${response.data.updates.updatedRange}`);
      return true;
    } catch (error) {
      logger.error(`Error appending call analysis data to ${sheetTitle} sheet:`, error);
      return false;
    }
  } catch (error) {
    logger.error('Unexpected error in appendCallAnalysisToGoogleSheet:', error);
    return false;
  }
}; 