const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user'); require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
mongoose.connect(process.env.DB_URI, {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function () {
    console.log('Connected to the database');

    const password = 'test123456';
    const userId = uuidv4();
    if (user) {
        console.log('用户:', user);
        bcrypt.compare(password, user.password, function (err, result) {
            if (err) {
                console.error('密码比较错误:', err);
            }
            if (result) {
                console.log('密码正确');
            } else {
                console.log('密码错误');
            }
        });
    } else {
        user = new User({
            userId,
            username,
        });

        await user.save();
        console.log('测试用户创建成功');
    }

    mongoose.connection.close();
});