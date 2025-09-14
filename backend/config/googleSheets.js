const { google } = require('googleapis');
const fs = require('fs');

/**
 * Google Sheets API Configuration
 */

let sheets = null;
let auth = null;
let spreadsheetId = null;

const configureGoogleSheets = () => {
  try {
    // Read service account credentials - check multiple locations
    let credentials;
    const possiblePaths = [
      '/etc/secrets/service-account.json', // Render deployment path
      './service-account.json', // Local development path
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON // Environment variable as fallback
    ];

    // Try to read from file paths first
    for (const path of possiblePaths.slice(0, 2)) {
      if (fs.existsSync(path)) {
        credentials = JSON.parse(fs.readFileSync(path, 'utf8'));
        console.log(`✅ Loaded service account from: ${path}`);
        break;
      }
    }

    // If no file found, try environment variable
    if (!credentials && process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      console.log('✅ Loaded service account from environment variable');
    }

    if (!credentials) {
      throw new Error('Service account credentials not found in any expected location');
    }

    // Create auth instance
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Create sheets instance
    sheets = google.sheets({ version: 'v4', auth });
    spreadsheetId = process.env.SPREADSHEET_ID;

    console.log('✅ Google Sheets API configured');
  } catch (error) {
    console.error('❌ Failed to configure Google Sheets:', error.message);
    process.exit(1);
  }
};

// Utility function to append rows to Google Sheets
const appendToSheet = async (tabName, values) => {
  if (!sheets || !auth || !spreadsheetId) {
    throw new Error('Google Sheets not configured');
  }

  const client = await auth.getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: tabName,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
};

module.exports = {
  configureGoogleSheets,
  appendToSheet,
  getSheets: () => sheets,
  getSpreadsheetId: () => spreadsheetId
};