const express = require('express');
const multer = require('multer');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateFields, sanitizeStrings } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { appendToSheet, getSheets, getSpreadsheetId } = require('../config/googleSheets');
const { uploadToCloudinary } = require('../utils/cloudinaryHelper');
const { sendNotification } = require('../services/notificationService');

const router = express.Router();

// Multer setup for in-memory upload
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Service Request Routes (Google Sheets Integration)
 */

// Create Service Request
router.post('/',
  authenticateToken,
  requireRole(['customer', 'channel_partner', 'system_integrator']),
  sanitizeStrings,
  validateFields(['customerName', 'serialNumber', 'productDetails', 'purchaseDate', 'faultDescription']),
  asyncHandler(async (req, res) => {
    const {
      customerName,
      customerEmail,
      serialNumber,
      productDetails,
      purchaseDate,
      photos,
      faultDescription,
      estimatedCost
    } = req.body;

    const photoString = Array.isArray(photos) ? photos.join('; ') : '';

    // Prepare row for Google Sheets
    const row = [
      customerName,
      serialNumber,
      productDetails,
      purchaseDate,
      photoString,
      faultDescription,
      'new', // status
      '', // assignedTo
      estimatedCost || '', // estimatedCost
      '', // dispatchDetails
      '', // repairDetails
      new Date().toISOString(),
    ];

    // Save to Google Sheets
    await appendToSheet('ServiceRequests', [row]);

    // Send "Created" notification to customer
    try {
      const customer = {
        name: customerName,
        email: customerEmail || req.user.email || 'customer@example.com',
        phone: req.user.phone || '+91-0000000000'
      };

      await sendNotification(customer, 'Created', {
        id: serialNumber // Using serial number as request ID
      });

      console.log(`📧 Notification sent to ${customer.email} for request ${serialNumber}`);
    } catch (notificationError) {
      console.error('Failed to send creation notification:', notificationError.message);
      // Don't fail the request creation if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Service request created successfully and notification sent',
      requestId: serialNumber
    });
  })
);

// Get Service Requests
router.get('/',
  authenticateToken,
  requireRole(['service_team', 'epr_team', 'channel_partner', 'system_integrator']),
  asyncHandler(async (req, res) => {
    const sheets = getSheets();
    const spreadsheetId = getSpreadsheetId();

    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ServiceRequests!A2:L',
    });

    const rows = resp.data.values || [];

    const tickets = rows.map((row, idx) => ({
      id: (idx + 1).toString(),
      ticketNumber: row[1] || `TICKET-${idx + 1}`,
      customerName: row[0] || '',
      serialNumber: row[1] || '',
      productType: row[2] || '',
      issue: row[5] || '',
      status: row[6] || 'new',
      priority: 'medium', // Default priority
      assignedTo: row[7] || '',
      estimatedCost: row[8] || '',
      dispatchDetails: row[9] || '',
      repairDetails: row[10] || '',
      createdAt: row[11] || '',
      updatedAt: row[11] || '',
      photos: row[4] ? row[4].split('; ') : [],
      description: row[5] || '',
    }));

    res.json({
      success: true,
      tickets,
      total: tickets.length
    });
  })
);

// Update Service Request Status
router.patch('/:ticketNumber',
  authenticateToken,
  requireRole(['service_team', 'epr_team']),
  sanitizeStrings,
  asyncHandler(async (req, res) => {
    const { ticketNumber } = req.params;
    const updates = req.body;

    const sheets = getSheets();
    const spreadsheetId = getSpreadsheetId();

    // Get current data
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ServiceRequests!A2:L',
    });

    const rows = resp.data.values || [];
    const rowIndex = rows.findIndex((row) => row[1] === ticketNumber);

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Service request not found'
      });
    }

    const row = rows[rowIndex];

    // Update fields
    if (updates.status !== undefined) row[6] = updates.status;
    if (updates.assignedTo !== undefined) row[7] = updates.assignedTo;
    if (updates.estimatedCost !== undefined) row[8] = updates.estimatedCost;
    if (updates.dispatchDetails !== undefined) row[9] = updates.dispatchDetails;
    if (updates.repairDetails !== undefined) row[10] = updates.repairDetails;

    row[11] = new Date().toISOString(); // Update timestamp

    // Save to Google Sheets
    const updateRange = `ServiceRequests!A${rowIndex + 2}:L${rowIndex + 2}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });

    res.json({
      success: true,
      message: 'Service request updated successfully',
      ticketNumber
    });
  })
);

// Upload Photos for Service Request
router.post('/upload-photos/:ticketNumber',
  authenticateToken,
  upload.array('photos'),
  asyncHandler(async (req, res) => {
    const { ticketNumber } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No photos uploaded'
      });
    }

    // Upload to Cloudinary
    const uploads = files.map((file) => uploadToCloudinary(file.buffer));
    const urls = await Promise.all(uploads);

    const sheets = getSheets();
    const spreadsheetId = getSpreadsheetId();

    // Get current data
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ServiceRequests!A2:L',
    });

    const rows = resp.data.values || [];
    const rowIndex = rows.findIndex((row) => row[1] === ticketNumber);

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Service request not found'
      });
    }

    const row = rows[rowIndex];

    // Update photos
    const existingPhotos = row[4] ? row[4].split('; ') : [];
    const allPhotos = [...existingPhotos, ...urls];
    row[4] = allPhotos.join('; ');
    row[11] = new Date().toISOString(); // Update timestamp

    // Save to Google Sheets
    const updateRange = `ServiceRequests!A${rowIndex + 2}:L${rowIndex + 2}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });

    res.json({
      success: true,
      message: 'Photos uploaded and attached successfully',
      photoUrls: urls,
      totalPhotos: allPhotos.length
    });
  })
);

module.exports = router;