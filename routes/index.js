const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const path = require('path');
const Page = require('../models/page');

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

// 添加动态页面路由
router.get('/p/:pageId', async (req, res) => {
  try {
    const page = await Page.findOne({ 
      pageId: req.params.pageId,
      status: true // 只处理启用状态的页面
    });

    if (!page) {
      return res.status(404).render('404');
    }

    if (page.type === 'link') {
      // 改为渲染带iframe的模板
      return res.render('iframe', {
        title: page.title,
        url: page.content 
      });
    } else {
      // 静态页面保持不变
      const filePath = path.join(__dirname, `../data/${page.userId}/${page.pageId}/index.html`);
      res.sendFile(filePath, err => {
        if (err) {
          res.status(404).render('404');
        }
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
