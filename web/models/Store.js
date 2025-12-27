const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  shop: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  accessToken: {
    type: String,
    required: true
  },
  installedAt: {
    type: Date,
    default: Date.now
  },
  settings: {
    defaultPosition: {
      type: String,
      enum: ['top', 'bottom', 'above-price', 'below-title'],
      default: 'above-price'
    },
    defaultColor: {
      type: String,
      default: '#FF0000'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Store', storeSchema);