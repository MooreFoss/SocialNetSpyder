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
    // 添加树状图显示相关字段
    nickname: { 
        type: String,
        default: function() {
            return `访客${this.guestId.slice(-6)}`
        }
    },
    firstVisit: {
        type: Date,
        default: Date.now
    },
    lastVisit: {
        type: Date,
        default: Date.now
    },
    totalVisits: {
        type: Number,
        default: 1
    }
});

// 用于树状��节点显示的虚拟字段
guestSchema.virtual('displayName').get(function() {
    return `${this.nickname} (${this.totalVisits}次访问)`;
});

module.exports = mongoose.model('Guest', guestSchema);
