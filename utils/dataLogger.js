// Data Logging Utility for Google Sheets
import { google } from 'googleapis';

// Initialize Google Sheets API for logging
const getGoogleSheetsInstance = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  return google.sheets({ version: 'v4', auth });
};

// Data logging configuration
const LOGGING_SPREADSHEET_ID = process.env.GOOGLE_LOGGING_SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID;

// Sheet names for different types of data
const SHEET_NAMES = {
  USER_ACTIONS: 'User_Actions_Log',
  SYSTEM_EVENTS: 'System_Events_Log', 
  API_REQUESTS: 'API_Requests_Log',
  EMAIL_NOTIFICATIONS: 'Email_Notifications_Log',
  ADMIN_ACTIVITIES: 'Admin_Activities_Log',
  ERROR_LOGS: 'Error_Logs'
};

// Create sheet if it doesn't exist
const createSheetIfNotExists = async (sheets, spreadsheetId, sheetName, headers) => {
  try {
    // Get spreadsheet info
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId
    });

    // Check if sheet exists
    const sheetExists = spreadsheet.data.sheets.some(
      sheet => sheet.properties.title === sheetName
    );

    if (!sheetExists) {
      console.log(`📊 Creating new sheet: ${sheetName}`);
      
      // Create the sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName
              }
            }
          }]
        }
      });

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [headers]
        }
      });

      console.log(`✅ Created sheet ${sheetName} with headers`);
    }
  } catch (error) {
    console.error(`❌ Error creating sheet ${sheetName}:`, error);
    throw error;
  }
};

// Initialize all logging sheets
const initializeLoggingSheets = async () => {
  try {
    const sheets = getGoogleSheetsInstance();

    // Define headers for each sheet
    const sheetConfigs = [
      {
        name: SHEET_NAMES.USER_ACTIONS,
        headers: ['Timestamp', 'User_ID', 'User_Email', 'Action_Type', 'Details', 'IP_Address', 'User_Agent', 'Status']
      },
      {
        name: SHEET_NAMES.SYSTEM_EVENTS,
        headers: ['Timestamp', 'Event_Type', 'Component', 'Description', 'Severity', 'Additional_Data']
      },
      {
        name: SHEET_NAMES.API_REQUESTS,
        headers: ['Timestamp', 'Method', 'Endpoint', 'User_ID', 'IP_Address', 'Status_Code', 'Response_Time_ms', 'Request_Size', 'Response_Size']
      },
      {
        name: SHEET_NAMES.EMAIL_NOTIFICATIONS,
        headers: ['Timestamp', 'Email_Type', 'Recipient', 'Subject', 'Status', 'Provider', 'Message_ID', 'Error_Details']
      },
      {
        name: SHEET_NAMES.ADMIN_ACTIVITIES,
        headers: ['Timestamp', 'Admin_Email', 'Activity_Type', 'Target_Resource', 'Details', 'Changes_Made', 'IP_Address']
      },
      {
        name: SHEET_NAMES.ERROR_LOGS,
        headers: ['Timestamp', 'Error_Type', 'Component', 'Error_Message', 'Stack_Trace', 'User_ID', 'Request_Data', 'Severity']
      }
    ];

    // Create all sheets
    for (const config of sheetConfigs) {
      await createSheetIfNotExists(sheets, LOGGING_SPREADSHEET_ID, config.name, config.headers);
    }

    console.log('✅ All logging sheets initialized');
  } catch (error) {
    console.error('❌ Error initializing logging sheets:', error);
  }
};

// Generic logging function
const logToSheet = async (sheetName, data) => {
  try {
    const sheets = getGoogleSheetsInstance();
    
    // Add timestamp as first column if not provided
    const timestampedData = [new Date().toISOString(), ...data];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: LOGGING_SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      resource: {
        values: [timestampedData]
      }
    });

    console.log(`📝 Logged data to ${sheetName}`);
  } catch (error) {
    console.error(`❌ Error logging to ${sheetName}:`, error);
    // Don't throw error to avoid breaking the main functionality
  }
};

// Specific logging functions
export const logUserAction = async (userId, userEmail, actionType, details, ipAddress = null, userAgent = null, status = 'success') => {
  const data = [userId, userEmail, actionType, details, ipAddress, userAgent, status];
  await logToSheet(SHEET_NAMES.USER_ACTIONS, data);
};

export const logSystemEvent = async (eventType, component, description, severity = 'info', additionalData = null) => {
  const data = [eventType, component, description, severity, JSON.stringify(additionalData)];
  await logToSheet(SHEET_NAMES.SYSTEM_EVENTS, data);
};

export const logAPIRequest = async (method, endpoint, userId = null, ipAddress = null, statusCode = null, responseTime = null, requestSize = null, responseSize = null) => {
  const data = [method, endpoint, userId, ipAddress, statusCode, responseTime, requestSize, responseSize];
  await logToSheet(SHEET_NAMES.API_REQUESTS, data);
};

export const logEmailNotification = async (emailType, recipient, subject, status, provider = null, messageId = null, errorDetails = null) => {
  const data = [emailType, recipient, subject, status, provider, messageId, errorDetails];
  await logToSheet(SHEET_NAMES.EMAIL_NOTIFICATIONS, data);
};

export const logAdminActivity = async (adminEmail, activityType, targetResource, details, changesMade = null, ipAddress = null) => {
  const data = [adminEmail, activityType, targetResource, details, JSON.stringify(changesMade), ipAddress];
  await logToSheet(SHEET_NAMES.ADMIN_ACTIVITIES, data);
};

export const logError = async (errorType, component, errorMessage, stackTrace = null, userId = null, requestData = null, severity = 'error') => {
  const data = [errorType, component, errorMessage, stackTrace, userId, JSON.stringify(requestData), severity];
  await logToSheet(SHEET_NAMES.ERROR_LOGS, data);
};

// Middleware helper to extract request info
export const getRequestInfo = (request) => {
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   request.ip || 
                   'Unknown';
  
  return { userAgent, ipAddress };
};

// Initialize logging when module is imported
let initialized = false;
export const ensureLoggingInitialized = async () => {
  if (!initialized && LOGGING_SPREADSHEET_ID) {
    await initializeLoggingSheets();
    initialized = true;
  }
};

// Auto-initialize if environment variable is set
if (LOGGING_SPREADSHEET_ID) {
  ensureLoggingInitialized().catch(console.error);
}

const dataLogger = {
  logUserAction,
  logSystemEvent,
  logAPIRequest,
  logEmailNotification,
  logAdminActivity,
  logError,
  getRequestInfo,
  ensureLoggingInitialized
};

export default dataLogger;
