const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  scanTime: { type: Date, default: Date.now },
  ipAddress: { type: String },
  browserInfo: { type: String },
});

module.exports = mongoose.model('User', userSchema);
