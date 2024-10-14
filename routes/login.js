const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

// 渲染登录页面
router.get('/', (req, res) => {
  res.render('login');
});

// 用户登录
router.post('/', async (req, res) => {
  const { username, password } = req.body;
  try {
    // 显式选择密码字段
    const user = await User.findOne({ username });
    if (!user) {
      console.log('用户不存在');
      return res.status(400).json({ msg: '用户名或密码错误' });
    }

    // 使用异步函数进行密码比较
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // console.log('密码正确');
      const payload = { userId: user.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/manage');
    } else {
      // console.log('密码错误');
      return res.status(400).json({ msg: '用户名或密码错误' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

module.exports = router;