const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.get('/', (req, res) => {
    res.render('register');
});

router.post('/', async (req, res) => {
    try {
        const { username, password, confirmPassword } = req.body;

        // 验证密码
        if (password !== confirmPassword) {
            return res.status(400).json({ msg: '两次输入的密码不一致' });
        }

        // 检查用户是否已存在
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: '用户名已存在' });
        }

        // 创建新用户
        user = new User({
            username,
            password
        });

        await user.save();
        res.status(201).json({ msg: '注册成功' });
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器错误');
    }
});

module.exports = router;