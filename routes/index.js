const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/db-status', (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? '数据库已连接' : '数据库已断开连接';
    res.json({ status: dbStatus });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


router.get('/', (req, res) => {
  res.render('index', {title: 'SocialNetSpyder'});
});

module.exports = router;
