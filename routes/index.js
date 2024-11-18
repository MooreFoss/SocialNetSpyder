const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// 添加检查登录状态的函数
const checkLoginStatus = (req) => {
  const token = req.cookies.token;
  if (!token) return false;
  
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch (err) {
    return false;
  }
};

router.get('/db-status', (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? '数据库已连接' : '数据库已断开连接';
    res.json({ status: dbStatus });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 修改首页路由
router.get('/', (req, res) => {
  const isLoggedIn = checkLoginStatus(req);
  res.render('index', { 
    title: 'SocialNetSpyder',
    isLoggedIn: isLoggedIn
  });
});

module.exports = router;
