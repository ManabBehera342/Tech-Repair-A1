const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateFields, sanitizeStrings } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { getSheets, getSpreadsheetId } = require('../config/googleSheets');
const { sendNotification, testEmailConfiguration } = require('../services/notificationService');

const router = express.Router();

/**
 * Notification Routes
 */

// Update status and send notifications
router.post('/update-status',
  authenticateToken,
  requireRole(['service_team', 'epr_team']),
  sanitizeStrings,
  validateFields(['requestId', 'newStatus']),
  asyncHandler(async (req, res) => {
    const { requestId, newStatus, extraData = {} } = req.body;

    // Validate status
    const validStatuses = ['Created', 'CostEstimate', 'Repaired', 'Dispatched'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
      });
    }

    // Mock customer data (in production, fetch from database by requestId)
    const mockCustomers = {
      'REQ-001': {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+91-9876543210'
      },
      'REQ-002': {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+91-9876543211'
      },
      'TEST-001': {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+91-9999999999'
      }
    };

    // Find customer (in production, query your database)
    let customer = mockCustomers[requestId];

    // If not found in mock data, try to fetch from Google Sheets
    if (!customer) {
      try {
        const sheets = getSheets();
        const spreadsheetId = getSpreadsheetId();

        const resp = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'ServiceRequests!A2:L',
        });

        const rows = resp.data.values || [];
        const requestRow = rows.find(row => row[1] === requestId); // serial number as ID

        if (requestRow) {
          customer = {
            name: requestRow[0], // customerName
            email: 'customer@example.com', // Default email (sheets don't store email)
            phone: '+91-0000000000' // Default phone
          };
        }
      } catch (error) {
        console.warn('Could not fetch from sheets:', error.message);
      }
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found for the given requestId'
      });
    }

    // Prepare notification data based on status
    let notificationData = {
      id: requestId,
      ...extraData
    };

    // Add status-specific data
    switch (newStatus) {
      case 'Created':
        // No additional data needed
        break;
      case 'CostEstimate':
        notificationData.amount = extraData.amount || '2,500';
        notificationData.description = extraData.description || 'Parts replacement and labor charges';
        break;
      case 'Repaired':
        notificationData.workDone = extraData.workDone || 'Component replacement and testing completed';
        break;
      case 'Dispatched':
        notificationData.trackingNo = extraData.trackingNo || 'TRP' + Date.now();
        notificationData.courier = extraData.courier || 'BlueDart';
        notificationData.expectedDelivery = extraData.expectedDelivery || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString();
        notificationData.trackingUrl = extraData.trackingUrl || `https://www.bluedart.com/tracking/${notificationData.trackingNo}`;
        break;
    }

    // Send notification
    await sendNotification(customer, newStatus, notificationData);

    // Update status in your database/sheets here
    console.log(`📋 Status updated: ${requestId} -> ${newStatus}`);

    res.json({
      success: true,
      message: `Status updated to ${newStatus} and notifications sent`,
      requestId,
      newStatus,
      customer: {
        name: customer.name,
        email: customer.email
      },
      notificationData
    });
  })
);

// Test notification endpoint (for development/demo purposes)
router.post('/test-notification',
  authenticateToken,
  requireRole(['service_team', 'epr_team']),
  asyncHandler(async (req, res) => {
    const { customerName, customerEmail, customerPhone, stage, extraData } = req.body;

    const testCustomer = {
      name: customerName || 'Test Customer',
      email: customerEmail || 'test@example.com',
      phone: customerPhone || '+91-9999999999'
    };

    const testData = {
      id: 'TEST-' + Date.now(),
      amount: '1,500',
      description: 'Screen replacement',
      workDone: 'LCD display replaced and tested',
      trackingNo: 'TEST123456',
      courier: 'BlueDart',
      expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      trackingUrl: 'https://www.bluedart.com/tracking/TEST123456',
      ...extraData
    };

    await sendNotification(testCustomer, stage || 'Created', testData);

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      testCustomer,
      stage: stage || 'Created'
    });
  })
);

// Test email configuration endpoint
router.get('/test-email-config',
  authenticateToken,
  requireRole(['service_team', 'epr_team']),
  asyncHandler(async (req, res) => {
    const isValid = await testEmailConfiguration();
    res.json({
      success: isValid,
      message: isValid ? 'Email configuration is valid' : 'Email configuration has issues',
      timestamp: new Date().toISOString()
    });
  })
);

module.exports = router;