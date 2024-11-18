// models/visit.js
const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    linkId: { type: String, required: true },
    guestId: { type: String, required: true },
    parentGuestId: { type: String },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String },
    pageId: { type: String, required: true }
});

module.exports = mongoose.model('Visit', visitSchema);