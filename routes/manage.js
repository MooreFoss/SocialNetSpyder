const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/user');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId); // 假设authMiddleware设置了req.user
        const currentTime = new Date().toLocaleString();
        res.render('manage/layout', {
            username: user.username,
            uuid: user.userId,
            currentTime: currentTime
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 仪表盘页面
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.render('manage/pages/dashboard', {
            currentPage: 'dashboard',
            username: user.username,
            uuid: user.userId,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 页面管理
router.get('/tasks', authMiddleware, (req, res) => {
    res.render('manage/pages/tasks', {
        currentPage: 'tasks',
        username: req.user.username
    });
});

// 数据分析
router.get('/data', authMiddleware, (req, res) => {
    res.render('manage/pages/data', {
        currentPage: 'data',
        username: req.user.username
    });
});

// 系统设置
router.get('/settings', authMiddleware, (req, res) => {
    res.render('manage/pages/settings', {
        currentPage: 'settings',
        username: req.user.username
    });
});

module.exports = router;