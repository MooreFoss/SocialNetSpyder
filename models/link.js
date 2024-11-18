const mongoose = require('mongoose');
const crypto = require('crypto');

function generateLinkId() {
  return crypto.randomBytes(4).toString('hex');
}

const linkSchema = new mongoose.Schema({
  linkId: { type: String, required: true, unique: true, default: generateLinkId },
  pageId: { type: String, required: true },
  creatorGuestId: { type: String },  // 创建者的guestId
  isActive: { type: Boolean, default: true },
  visitCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Link', linkSchema);