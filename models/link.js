const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  linkId: { type: String, required: true, unique: true },
  originalUrl: { type: String, required: true },
  creationTime: { type: Date, default: Date.now },
  status: { type: Boolean, default: true },
  appId: { type: String, required: true },
});

module.exports = mongoose.model('Link', linkSchema);
