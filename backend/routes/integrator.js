const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateFields, sanitizeStrings } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { Project, Device } = require('../models');

const router = express.Router();

/**
 * System Integrator Routes
 */

// Get all projects for a specific integrator with nested device info
router.get('/:integratorId/projects',
  authenticateToken,
  requireRole(['system_integrator', 'epr_team']),
  asyncHandler(async (req, res) => {
    const { integratorId } = req.params;

    // Fetch all projects for the integrator
    const projects = await Project.find({ integratorId })
      .sort({ updatedAt: -1 })
      .lean();

    // For each project, fetch associated devices
    const projectsWithDevices = await Promise.all(
      projects.map(async (project) => {
        const devices = await Device.find({ projectId: project.projectId })
          .select('serialNumber productType status faultHistory')
          .lean();

        // Update project counts
        const openRequests = devices.reduce((count, device) => {
          const openFaults = device.faultHistory?.filter(fault => fault.status !== 'Resolved').length || 0;
          return count + openFaults;
        }, 0);

        return {
          ...project,
          numberOfDevices: devices.length,
          openRequests,
          devices: devices.map(device => ({
            serialNumber: device.serialNumber,
            productType: device.productType,
            status: device.status,
            faultHistory: device.faultHistory || []
          }))
        };
      })
    );

    res.json({
      success: true,
      projects: projectsWithDevices,
      total: projectsWithDevices.length
    });
  })
);

// Get fault statistics for a specific integrator
router.get('/:integratorId/fault-stats',
  authenticateToken,
  requireRole(['system_integrator', 'epr_team']),
  asyncHandler(async (req, res) => {
    const { integratorId } = req.params;

    // Get all devices for this integrator
    const devices = await Device.find({ integratorId }).lean();

    // Aggregate fault statistics
    const faultStats = {
      totalDevices: devices.length,
      totalFaults: 0,
      openFaults: 0,
      resolvedFaults: 0,
      commonFaults: {},
      faultTrends: [],
      deviceStatusBreakdown: {
        Operational: 0,
        Faulty: 0,
        'Under Repair': 0,
        Replaced: 0,
        Decommissioned: 0
      }
    };

    // Process each device
    devices.forEach(device => {
      // Count device statuses
      faultStats.deviceStatusBreakdown[device.status] =
        (faultStats.deviceStatusBreakdown[device.status] || 0) + 1;

      // Process fault history
      if (device.faultHistory && device.faultHistory.length > 0) {
        device.faultHistory.forEach(fault => {
          faultStats.totalFaults++;

          if (fault.status === 'Resolved') {
            faultStats.resolvedFaults++;
          } else {
            faultStats.openFaults++;
          }

          // Count common fault types
          const faultType = fault.faultType || 'Unknown';
          faultStats.commonFaults[faultType] =
            (faultStats.commonFaults[faultType] || 0) + 1;
        });
      }
    });

    // Generate fault trends (last 6 months)
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });

      // Count faults for this month
      const faultsThisMonth = devices.reduce((count, device) => {
        if (device.faultHistory) {
          return count + device.faultHistory.filter(fault => {
            const faultDate = new Date(fault.reportedDate);
            return faultDate.getMonth() === date.getMonth() &&
                   faultDate.getFullYear() === date.getFullYear();
          }).length;
        }
        return count;
      }, 0);

      faultStats.faultTrends.push({
        month: monthName,
        faults: faultsThisMonth
      });
    }

    // Convert commonFaults object to array for easier frontend consumption
    faultStats.commonFaultsArray = Object.entries(faultStats.commonFaults)
      .map(([faultType, count]) => ({ faultType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 most common faults

    res.json({
      success: true,
      stats: faultStats
    });
  })
);

// Create a new project for a system integrator
router.post('/:integratorId/projects',
  authenticateToken,
  requireRole(['system_integrator']),
  sanitizeStrings,
  validateFields(['name', 'location']),
  asyncHandler(async (req, res) => {
    const { integratorId } = req.params;
    const { name, location, description, budget, expectedEndDate } = req.body;

    // Generate unique project ID
    const existingCount = await Project.countDocuments({ integratorId });
    const projectId = `PROJ-${integratorId.slice(0, 4).toUpperCase()}-${String(existingCount + 1).padStart(3, '0')}`;

    const newProject = new Project({
      projectId,
      integratorId,
      name,
      location,
      description,
      budget,
      expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : undefined,
      numberOfDevices: 0,
      openRequests: 0
    });

    await newProject.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: newProject
    });
  })
);

// Add devices to a project (for CSV upload functionality)
router.post('/:integratorId/projects/:projectId/devices',
  authenticateToken,
  requireRole(['system_integrator']),
  asyncHandler(async (req, res) => {
    const { integratorId, projectId } = req.params;
    const { devices } = req.body;

    if (!devices || !Array.isArray(devices)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid devices data. Expected array of devices.'
      });
    }

    // Verify project exists and belongs to this integrator
    const project = await Project.findOne({ projectId, integratorId });
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Create devices
    const deviceDocs = devices.map(device => ({
      ...device,
      projectId,
      integratorId,
      faultHistory: device.faultHistory || []
    }));

    await Device.insertMany(deviceDocs, { ordered: false }); // ordered: false to continue on duplicate errors

    // Update project device count
    const deviceCount = await Device.countDocuments({ projectId });
    await Project.findOneAndUpdate(
      { projectId },
      { numberOfDevices: deviceCount }
    );

    res.status(201).json({
      success: true,
      message: `Successfully added ${deviceDocs.length} devices to project`,
      devicesAdded: deviceDocs.length
    });
  })
);

module.exports = router;