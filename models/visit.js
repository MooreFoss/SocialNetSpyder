const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    linkId: { type: String, required: true },
    guestId: { type: String, required: true },
    parentGuestId: { type: String },
    timestamp: { type: Date, default: Date.now },
    // 添加树状结构相关字段
    depth: { type: Number, default: 0 },
    path: [{ type: String }], // 完整路径数组
    leafNode: { type: Boolean, default: true }, // 是否为叶子节点
    childCount: { type: Number, default: 0 }, // 直接子节点数
    descendantCount: { type: Number, default: 0 }, // 所有后代节点数
    // 关联访客信息
    guest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest',
        required: true
    }
});

// 添加复合索引优化查询性能
visitSchema.index({ linkId: 1, depth: 1 }); 
visitSchema.index({ parentGuestId: 1, timestamp: 1 });
visitSchema.index({ path: 1 });

// 更新节点的子节点计数
visitSchema.pre('save', async function(next) {
    if (this.parentGuestId) {
        await this.constructor.updateOne(
            { guestId: this.parentGuestId },
            { 
                $inc: { childCount: 1, descendantCount: 1 },
                $set: { leafNode: false }
            }
        );
    }
    // 计算完整路径
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