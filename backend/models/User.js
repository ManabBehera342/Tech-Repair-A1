const mongoose = require('mongoose');

/**
 * User Model
 * Handles authentication and user management
 */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['customer', 'service_team', 'epr_team', 'channel_partner', 'system_integrator'],
      default: 'customer',
      index: true
    },
    phone: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Index for efficient queries
userSchema.index({ email: 1, role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;