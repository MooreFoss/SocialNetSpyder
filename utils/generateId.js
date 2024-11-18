const crypto = require('crypto');

function generateGuestId() {
    return crypto.randomBytes(4).toString('hex');
}

module.exports = generateGuestId;