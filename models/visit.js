// models/visit.js
const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    linkId: { type: String, required: true },
    guestId: { type: String, required: true },
    parentGuestId: { type: String },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String },
    pageId: { type: String, required: true },
    depth: { type: Number, default: 0 }, // 添加深度字段
    ancestors: [{ // 存储主要祖先节点(有限数量)
        guestId: String,
        timestamp: Date
    }],
    pathHash: String // 路径哈希,用于快速对比
});

// 基本字段索引
visitSchema.index({ linkId: 1 });
visitSchema.index({ guestId: 1 });
visitSchema.index({ pageId: 1 });

// 复合索引支持分析查询
visitSchema.index({ linkId: 1, timestamp: -1 }); // 时序分析
visitSchema.index({ pageId: 1, depth: 1 }); // 传播深度分析
visitSchema.index({ parentGuestId: 1, timestamp: 1 }); // 传播路径分析

// 特殊用途索引
visitSchema.index({ pathHash: 1 }); // 路径匹配
visitSchema.index({ depth: 1 }); // 层级分析

// 添加前置钩子计算深度和更新祖先
visitSchema.pre('save', async function (next) {
    if (this.parentGuestId) {
        const parent = await this.constructor.findOne({ guestId: this.parentGuestId });
        if (parent) {
            this.depth = parent.depth + 1;
            // 只保留最近的10个祖先
            this.ancestors = [...(parent.ancestors || []), {
                guestId: parent.guestId,
                timestamp: parent.timestamp
            }].slice(-10);
        }
    }
    // 生成路径哈希
    this.pathHash = require('crypto')
        .createHash('md5')
        .update(this.ancestors.map(a => a.guestId).join(':'))
        .digest('hex');
    next();
});

module.exports = mongoose.model('Visit', visitSchema);