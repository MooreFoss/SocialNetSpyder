const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

module.exports = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    // 401 错误重定向到主页
    return res.redirect('/');
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    // 400 错误重定向到主页
    res.redirect('/');
  }
};