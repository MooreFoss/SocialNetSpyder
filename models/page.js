const mongoose = require('mongoose');
const crypto = require('crypto');

function generatePageId() {
    return crypto.randomBytes(4).toString('hex');
}

const pageSchema = new mongoose.Schema({
    pageId: {
        type: String,
        required: true,
        unique: true,
        default: generatePageId
    },
    userId: {
        type: String,
        required: true,
        ref: 'User' // 添加引用关系
    },
    type: {
        type: String,
        required: true,
        enum: ['static', 'link']
    },
    title: {
        type: String,
        required: true
    },
    content: String, // 外部链接URL或静态页面内容
    creationTime: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Page', pageSchema);