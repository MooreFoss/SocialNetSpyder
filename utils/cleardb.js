const mongoose = require('mongoose');
const readline = require('readline');
const config = require('../config/db');
require('dotenv').config();
// 导入所有模型
const Visit = require('../models/visit');
const Guest = require('../models/guests');
const Link = require('../models/link');
const Page = require('../models/page');
const User = require('../models/user');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function clearDatabase() {
    try {
        // 连接数据库
        const connectDB = async () => {
            try {
                await mongoose.connect(process.env.DB_URI, {
                    user: process.env.DB_USER,
                    pass: process.env.DB_PASS,
                });
                console.log('MongoDB connected');
            } catch (err) {
                console.error(err.message);
                process.exit(1);
            }
        };
        module.exports = connectDB;
        console.log('已连接到数据库');

        // 确认提示
        const answer = await new Promise(resolve => {
            rl.question('警告: 即将清空所有数据! 输入 "YES" 确认操作: ', resolve);
        });

        if (answer !== 'YES') {
            console.log('操作已取消');
            process.exit(0);
        }

        // 按照依赖关系顺序删除集合
        console.log('开始清理数据...');

        await Visit.deleteMany({});
        console.log('- 已清空访问记录');

        await Guest.deleteMany({});
        console.log('- 已清空访客信息');

        await Link.deleteMany({});
        console.log('- 已清空分享链接');

        await Page.deleteMany({});
        console.log('- 已清空页面数据');

        await User.deleteMany({});
        console.log('- 已清空用户数据');

        console.log('数据库清理完成!');

    } catch (err) {
        console.error('清理过程出错:', err);
    } finally {
        await mongoose.connection.close();
        rl.close();
    }
}

clearDatabase();