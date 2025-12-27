const mongoose = require('mongoose');

const timerSchema = new mongoose.Schema({
  shop: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOptions: {
    position: {
      type: String,
      enum: ['top', 'bottom', 'above-price', 'below-title'],
      default: 'above-price'
    },
    backgroundColor: {
      type: String,
      default: '#FF0000'
    },
    textColor: {
      type: String,
      default: '#FFFFFF'
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    showDays: {
      type: Boolean,
      default: true
    },
    showHours: {
      type: Boolean,
      default: true
    },
    showMinutes: {
      type: Boolean,
      default: true
    },
    showSeconds: {
      type: Boolean,
      default: true
    }
  },
  urgencySettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    threshold: {
      type: Number,
      default: 5, // minutes
      min: 1,
      max: 60
    },
    pulseEffect: {
      type: Boolean,
      default: true
    },
    showBanner: {
      type: Boolean,
      default: true
    },
    bannerText: {
      type: String,
      default: 'Hurry! Offer ending soon!'
    }
  },
  targetProducts: {
    type: String,
    enum: ['all', 'specific'],
    default: 'all'
  },
  productIds: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
timerSchema.index({ shop: 1, isActive: 1, startDate: 1, endDate: 1 });

// Virtual property to check if timer is currently running
timerSchema.virtual('isRunning').get(function () {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

// Method to check if urgency mode should be active
timerSchema.methods.isUrgent = function () {
  if (!this.urgencySettings.enabled) return false;

  const now = new Date();
  const timeLeft = this.endDate - now;
  const urgencyThreshold = this.urgencySettings.threshold * 60 * 1000; // Convert to ms

  return timeLeft > 0 && timeLeft <= urgencyThreshold;
};

module.exports = mongoose.model('Timer', timerSchema);