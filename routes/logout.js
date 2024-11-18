const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    // 清除token cookie
    res.clearCookie('token');
    res.status(200).json({ msg: '已退出登录' });
});

module.exports = router;