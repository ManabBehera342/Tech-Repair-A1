const mongoose = require('mongoose');

/**
 * Project Model
 * For System Integrator project management
 */

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    integratorId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    numberOfDevices: {
      type: Number,
      default: 0,
      min: 0
    },
    openRequests: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'On Hold', 'Cancelled'],
      default: 'Active',
      index: true
    },
    budget: {
      type: Number,
      min: 0
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    expectedEndDate: {
      type: Date
    },
    actualEndDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient queries
projectSchema.index({ integratorId: 1, status: 1 });
projectSchema.index({ integratorId: 1, updatedAt: -1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;