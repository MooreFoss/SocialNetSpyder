const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    linkId: { type: String, required: true },
    guestId: { type: String, required: true },
    parentGuestId: { type: String },
    timestamp: { type: Date, default: Date.now },
    depth: { type: Number, default: 0 },
    path: [{ type: String }],
    leafNode: { type: Boolean, default: true },
    childCount: { type: Number, default: 0 },
    descendantCount: { type: Number, default: 0 },
    guest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest',
        required: true
    }
});

visitSchema.index({ linkId: 1, depth: 1 });
visitSchema.index({ parentGuestId: 1, timestamp: 1 });
visitSchema.index({ path: 1 });

visitSchema.pre('save', async function (next) {
    if (this.parentGuestId) {
        await this.constructor.updateOne(
            { guestId: this.parentGuestId },
            {
                $inc: { childCount: 1, descendantCount: 1 },
                $set: { leafNode: false }
            }
        );
    }
    if (this.parentGuestId) {
        const parent = await this.constructor.findOne({ guestId: this.parentGuestId });
        if (parent) {
            this.path = [...parent.path, this.guestId];
            this.depth = parent.depth + 1;
        }
    } else {
        this.path = [this.guestId];
    }
    next();
});

module.exports = mongoose.model('Visit', visitSchema);