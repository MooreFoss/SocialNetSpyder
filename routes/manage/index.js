const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const User = require('../../models/user');

router.use(authMiddleware, async (req, res, next) => {
    try {
        // 修改查询方式，确保正确获取用户
        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(401).redirect('/login');
        }
        res.locals.user = user;
        next();
    } catch (err) {
        console.error('User lookup error:', err);
        return res.status(500).redirect('/login');
    }
});

router.use('/', require('./dashboard'));
router.use('/tasks', require('./tasks'));
router.use('/tasks/files', require('./files'));  // 修改这一行
router.use('/data', require('./data'));
router.use('/settings', require('./settings'));

module.exports = router;