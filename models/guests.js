const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  guestId: { type: String, required: true, unique: true },
  scanTime: { type: Date, default: Date.now },
  ipAddress: { type: String },
  browserInfo: { type: String },
});

module.exports = mongoose.model('Guest', guestSchema);
