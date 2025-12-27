const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  shop: {
    type: String,
    required: true,
    index: true
  },
  state: String,
  isOnline: Boolean,
  scope: String,
  expires: Date,
  accessToken: String,
  onlineAccessInfo: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);