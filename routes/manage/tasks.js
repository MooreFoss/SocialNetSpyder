const express = require('express');
const router = express.Router();
const Page = require('../../models/page');
const fs = require('fs-extra');
const path = require('path');

// 添加根路由处理
router.get('/', (req, res) => {
    res.render('manage/pages/tasks', {
        currentPage: 'tasks',
        username: res.locals.user.username
    });
});

// 创建新页面
router.post('/create', async (req, res) => {
    try {
        const { title, type, content } = req.body;
        const userId = res.locals.user.userId;

        const page = new Page({
            title,
            type,
            content,
            userId: res.locals.user.userId // 确保使用UUID
        });

        await page.save();

        if (type === 'static') {
            const dir = path.join(__dirname, `../../data/${userId}/${page.pageId}`);
            await fs.ensureDir(dir);
        }

        res.status(201).json(page);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '创建失败' });
    }
});

// 获取页面列表
router.get('/pages', async (req, res) => {
    try {
        const pages = await Page.find({ userId: res.locals.user.userId });
        res.json(pages);
    } catch (err) {
        res.status(500).json({ msg: '获取失败' });
    }
});

// 切换页面状态
router.post('/toggle', async (req, res) => {
    try {
        const { pageId, status } = req.body;
        await Page.findOneAndUpdate(
            { pageId, userId: res.locals.user.userId },
            { status }
        );
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ msg: '操作失败' });
    }
});

// 删除页面
router.post('/delete', async (req, res) => {
    try {
        const { pageId } = req.body;
        // 确保只能删除自己的页面
        await Page.findOneAndDelete({
            pageId,
            userId: res.locals.user.userId
        });
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '删除失败' });
    }
});

module.exports = router;