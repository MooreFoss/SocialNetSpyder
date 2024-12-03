const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user'); // 确保路径正确
require('dotenv').config();
const { v4: uuidv4 } = require('uuid'); // 引入UUID库

// 连接数据库
mongoose.connect(process.env.DB_URI, {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function () {
    console.log('Connected to the database');

    // 创建测试用户
    const username = 'test';
    const password = 'test123456';
    const userId = uuidv4(); // 使用UUID生成用户ID

    // 检查用户是否已经存在
    let user = await User.findOne({ username });
    if (user) {
        console.log('用户已存在');
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
        // 创建新用户
        user = new User({
            userId,
            username,
            password: password,
        });

        await user.save();
        console.log('测试用户创建成功');
    }

    // 关闭数据库连接
    mongoose.connection.close();
});