const mongoose = require('mongoose');
const Visit = require('../models/visit');
const Guest = require('../models/guests');

async function migrateVisits() {
    const visits = await Visit.find({ guest: { $exists: false } });

    for (const visit of visits) {
        const guest = await Guest.findOne({ guestId: visit.guestId });
        if (guest) {
            visit.guest = guest._id;
            await visit.save();
        }
    }
}

migrateVisits().then(() => console.log('Migration complete'));