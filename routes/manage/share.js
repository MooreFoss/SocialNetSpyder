const express = require('express');
const router = express.Router();
const Link = require('../../models/link');
const Visit = require('../../models/visit');
const Guest = require('../../models/guests');
const Page = require('../../models/page');

// 添加分享管理首页路由
router.get('/', async (req, res) => {
    res.render('manage/pages/share', {
        currentPage: 'share'
    });
});

// 获取所有分享链接列表
router.get('/all', async (req, res) => {
    try {
        // 获取用户所有页面
        const userPages = await Page.find({ userId: res.locals.user.userId });
        const pageIds = userPages.map(page => page.pageId);

        // 获取这些页面的所有分享链接
        const links = await Link.find({ pageId: { $in: pageIds } });

        // 整合页面信息
        const sharesWithPageInfo = links.map(link => {
            const page = userPages.find(p => p.pageId === link.pageId);
            return {
                ...link.toObject(),
                pageTitle: page ? page.title : '未知页面'
            };
        });

        res.json(sharesWithPageInfo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '获取分享链接列表失败' });
    }
});

// 创建分享链接
router.post('/create', async (req, res) => {
    try {
        const { pageId } = req.body;

        // 验证页面所有权
        const page = await Page.findOne({
            pageId,
            userId: res.locals.user.userId
        });

        if (!page) {
            return res.status(403).json({ error: '无权限创建分享链接' });
        }

        const link = new Link({
            pageId,
            creatorGuestId: req.cookies.guestId,
            visitCount: 0
        });

        await link.save();
        res.json({ shareUrl: `/s/${link.linkId}` });
    } catch (err) {
        res.status(500).json({ error: '创建分享链接失败' });
    }
});

// 切换分享链接状态
router.post('/toggle', async (req, res) => {
    try {
        const { linkId, status } = req.body;

        // 验证链接所有权
        const link = await Link.findOne({ linkId });
        if (!link) {
            return res.status(404).json({ error: '链接不存在' });
        }

        const page = await Page.findOne({
            pageId: link.pageId,
            userId: res.locals.user.userId
        });

        if (!page) {
            return res.status(403).json({ error: '无权限操作此链接' });
        }

        await Link.findOneAndUpdate(
            { linkId },
            { isActive: status }
        );
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ error: '操作失败' });
    }
});

// 删除分享链接
router.post('/delete', async (req, res) => {
    try {
        const { linkId } = req.body;

        // 验证链接所有权
        const link = await Link.findOne({ linkId });
        if (!link) {
            return res.status(404).json({ error: '链接不存在' });
        }

        const page = await Page.findOne({
            pageId: link.pageId,
            userId: res.locals.user.userId
        });

        if (!page) {
            return res.status(403).json({ error: '无权限删除此链接' });
        }

        await Link.findOneAndDelete({ linkId });
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ error: '删除失败' });
    }
});

router.get('/:pageId', async (req, res) => {
    try {
        const pageId = req.params.pageId;
        const page = await Page.findOne({ pageId, userId: res.locals.user.userId });

        if (!page) {
            return res.status(404).render('404');
        }

        res.render('manage/share', {
            page,
            pageId,
            currentPage: 'share'
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 获取分享链接列表
router.get('/:pageId/list', async (req, res) => {
    try {
        const links = await Link.find({ pageId: req.params.pageId });
        res.json(links);
    } catch (err) {
        res.status(500).json({ error: '获取分享链接列表失败' });
    }
});

module.exports = router;