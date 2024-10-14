const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send('Access Denied');
  }

  try {
    const verified = jwt.verify(token, 'yourSecretKey');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};