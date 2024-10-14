const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/user');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId); // 假设authMiddleware设置了req.user
        const currentTime = new Date().toLocaleString();
        res.render('manage', {
            username: user.username,
            uuid: user.userId,
            currentTime: currentTime
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;