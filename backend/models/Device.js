const mongoose = require('mongoose');

/**
 * Device Model
 * For System Integrator device management
 */

const faultHistorySchema = new mongoose.Schema({
  faultType: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  reportedDate: {
    type: Date,
    default: Date.now
  },
  resolvedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  },
  reportedBy: {
    type: String,
    trim: true
  },
  resolvedBy: {
    type: String,
    trim: true
  },
  cost: {
    type: Number,
    min: 0
  }
});

const deviceSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    projectId: {
      type: String,
      required: true,
      index: true
    },
    integratorId: {
      type: String,
      required: true,
      index: true
    },
    productType: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    manufacturer: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['Operational', 'Faulty', 'Under Repair', 'Replaced', 'Decommissioned'],
      default: 'Operational',
      index: true
    },
    faultHistory: [faultHistorySchema],
    installationDate: {
      type: Date,
      default: Date.now
    },
    lastMaintenanceDate: {
      type: Date
    },
    warrantyExpiry: {
      type: Date
    },
    location: {
      type: String,
      trim: true
    },
    specifications: {
      type: Map,
      of: String
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient queries
deviceSchema.index({ projectId: 1, status: 1 });
deviceSchema.index({ integratorId: 1, status: 1 });
deviceSchema.index({ projectId: 1, productType: 1 });

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;