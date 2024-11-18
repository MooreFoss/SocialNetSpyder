const mongoose = require('mongoose');
const generateGuestId = require('../utils/generateId');

const guestSchema = new mongoose.Schema({
    guestId: {
        type: String,
        required: true,
        unique: true,
        default: generateGuestId
    },
    ipAddress: String,
    browserInfo: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Guest', guestSchema);
