const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    res.render('manage/pages/settings', {
        currentPage: 'settings',
        username: res.locals.user.username
    });
});

router.post('/change-password', async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = res.locals.user;

    try {
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({ error: '当前密码错误' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: '两次输入的新密码不一致' });
        }

        // 加密新密码

        // 更新数据库中的密码
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });
        res.json({ message: '密码修改成功' });
    } catch (err) {
        res.status(500).json({ error: '服务器错误' });
    }
});

module.exports = router;