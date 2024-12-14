const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

router.get('/', (req, res) => {
  res.render('login');
});

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!user) {
      console.log('用户不存在');
      return res.status(400).json({ msg: '用户名或密码错误' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    const payload = { userId: user.userId };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true });
    return res.status(200).json({ msg: '登录成功' });
  } else {
    return res.status(400).json({ msg: '用户名或密码错误' });
  }
} catch (err) {
  console.error(err.message);
  res.status(500).send('服务器错误');
}
});

module.exports = router;