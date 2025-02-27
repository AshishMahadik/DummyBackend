const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  deviceInfo: {
    type: Object, // Store structured device/browser info
    required: false,
  },
  ipAddress: {
    type: String, // Store IP address for tracking
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    // index: { expires: 7 * 24 * 60 * 60 }, // Auto-delete sessions after 7 days
  },
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
