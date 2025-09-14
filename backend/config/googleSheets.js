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
    // Read service account credentials
    const credentials = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));

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