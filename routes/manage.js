const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/user');

// 添加用户信息中间件
router.use(authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        // 将用户信息存储在 res.locals 中,这样所有路由都能访问
        res.locals.user = user;
        next();
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 修改根路由处理 - 重定向到 dashboard
router.get('/', (req, res) => {
    res.redirect('/manage/dashboard');
});

router.get('/dashboard', (req, res) => {
    res.render('manage/pages/dashboard', {
        currentPage: 'dashboard',
        username: res.locals.user.username,
        uuid: res.locals.user.userId,
    });
});

router.get('/tasks', (req, res) => {
    res.render('manage/pages/tasks', {
        currentPage: 'tasks',
        username: res.locals.user.username
    });
});

router.get('/data', (req, res) => {
    res.render('manage/pages/data', {
        currentPage: 'data',
        username: res.locals.user.username
    });
});

router.get('/settings', (req, res) => {
    res.render('manage/pages/settings', {
        currentPage: 'settings',
        username: res.locals.user.username
    });
});

module.exports = router;