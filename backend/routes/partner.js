const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateFields, sanitizeStrings } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { Request } = require('../models');

const router = express.Router();

/**
 * Channel Partner Routes
 */

// Get all requests for a specific partner with optional filtering
router.get('/:partnerId/requests',
  authenticateToken,
  requireRole(['channel_partner', 'epr_team']),
  asyncHandler(async (req, res) => {
    const { partnerId } = req.params;
    const { status } = req.query;

    // Build query object
    let query = { partnerId };

    // Add status filter if provided
    if (status && status !== 'All') {
      query.status = status;
    }

    // Fetch requests from MongoDB
    const requests = await Request.find(query)
      .sort({ updatedAt: -1 }) // Sort by most recently updated first
      .lean(); // Return plain JavaScript objects for better performance

    // Transform to match frontend expectations
    const transformedRequests = requests.map(request => ({
      id: request.id,
      customerName: request.customerName,
      product: request.product,
      serialNumber: request.serialNumber,
      fault: request.fault,
      status: request.status,
      lastUpdate: request.updatedAt.toISOString(),
      createdAt: request.createdAt.toISOString(),
      partnerId: request.partnerId
    }));

    res.json({
      success: true,
      requests: transformedRequests,
      total: transformedRequests.length
    });
  })
);

// Create a new request for a channel partner
router.post('/:partnerId/requests',
  authenticateToken,
  requireRole(['channel_partner']),
  sanitizeStrings,
  validateFields(['customerName', 'serialNumber', 'product', 'fault']),
  asyncHandler(async (req, res) => {
    const { partnerId } = req.params;
    const { customerName, serialNumber, product, fault } = req.body;

    // Generate unique request ID
    const existingCount = await Request.countDocuments({ partnerId });
    const requestId = `REQ-${partnerId.slice(0, 4).toUpperCase()}-${String(existingCount + 1).padStart(3, '0')}`;

    // Create new request
    const newRequest = new Request({
      id: requestId,
      partnerId,
      customerName,
      product,
      serialNumber,
      fault,
      status: 'Pending'
    });

    await newRequest.save();

    // Return the created request
    const response = {
      id: newRequest.id,
      customerName: newRequest.customerName,
      product: newRequest.product,
      serialNumber: newRequest.serialNumber,
      fault: newRequest.fault,
      status: newRequest.status,
      lastUpdate: newRequest.updatedAt.toISOString(),
      createdAt: newRequest.createdAt.toISOString(),
      partnerId: newRequest.partnerId
    };

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      request: response
    });
  })
);

// Update request status
router.patch('/:partnerId/requests/:requestId',
  authenticateToken,
  requireRole(['channel_partner', 'service_team', 'epr_team']),
  sanitizeStrings,
  asyncHandler(async (req, res) => {
    const { partnerId, requestId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'Approved', 'Repaired', 'Dispatched'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Find and update the request
    const request = await Request.findOneAndUpdate(
      { id: requestId, partnerId },
      {
        ...(status && { status }),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Return updated request
    const response = {
      id: request.id,
      customerName: request.customerName,
      product: request.product,
      serialNumber: request.serialNumber,
      fault: request.fault,
      status: request.status,
      lastUpdate: request.updatedAt.toISOString(),
      createdAt: request.createdAt.toISOString(),
      partnerId: request.partnerId
    };

    res.json({
      success: true,
      message: 'Request updated successfully',
      request: response
    });
  })
);

module.exports = router;