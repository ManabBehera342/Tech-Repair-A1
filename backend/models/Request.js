const mongoose = require('mongoose');

/**
 * Service Request Model
 * For Channel Partners service requests
 */

const requestSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    partnerId: {
      type: String,
      required: true,
      index: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    product: {
      type: String,
      required: true,
      trim: true
    },
    serialNumber: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    fault: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Repaired', 'Dispatched'],
      default: 'Pending',
      index: true
    },
    estimatedCost: {
      type: Number,
      min: 0
    },
    actualCost: {
      type: Number,
      min: 0
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
requestSchema.index({ partnerId: 1, status: 1 });
requestSchema.index({ partnerId: 1, createdAt: -1 });

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;