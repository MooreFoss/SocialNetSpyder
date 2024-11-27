const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const Page = require('../../models/page');

// 添加在文件开头的路由配置部分
router.get('/', (req, res) => {
    res.render('manage/pages/files', {
        currentPage: 'files',
        username: res.locals.user.username
    });
});

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!req.user) {
            return cb(new Error('未授权'));
        }
        const dir = path.join(__dirname, '../../data', req.user.userId, req.params.pageId);
        fs.ensureDir(dir)
            .then(() => cb(null, dir))
            .catch(err => cb(err));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024
    }
});

// 文件管理页面
router.get('/:pageId', async (req, res) => {
    try {
        const page = await Page.findOne({
            pageId: req.params.pageId,
            userId: res.locals.user.userId
        });

        if (!page || page.type !== 'static') {
            return res.status(404).render('404');
        }

        res.render('manage/pages/files', {
            page,
            pageId: page.pageId,
            userId: res.locals.user.userId
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 文件上传路由
router.post('/:pageId/upload', async (req, res) => {
    try {
        console.log('查询参数:', {
            pageId: req.params.pageId,
            userId: req.user.userId
        });

        const page = await Page.findOne({
            pageId: req.params.pageId,
            userId: req.user.userId
        });

        console.log(page);
        if (!page || page.type !== 'static') {
            return res.status(403).json({ error: '无权限上传文件' });
        }

        const uploadMiddleware = upload.array('files');
        uploadMiddleware(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: '文件大小超出限制' });
                }
                return res.status(400).json({ error: err.message });
            } else if (err) {
                console.error('File upload error:', err);
                return res.status(500).json({ error: '文件上传失败' });
            }

            res.json({
                success: true,
                message: '文件上传成功'
            });
        });
    } catch (err) {
        console.error('Upload handler error:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取文件列表路由
router.get('/:pageId/list', async (req, res) => {
    try {
        const dir = path.join(__dirname, '../../data', res.locals.user.userId, req.params.pageId);
        await fs.ensureDir(dir);

        const files = await fs.readdir(dir);
        const fileStats = await Promise.all(
            files.map(async file => {
                const stats = await fs.stat(path.join(dir, file));
                return {
                    name: file,
                    size: stats.size,
                    mtime: stats.mtime
                };
            })
        );

        res.json(fileStats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '获取文件列表失败' });
    }
});

// 删除文件
router.post('/:pageId/delete', async (req, res) => {
    try {
        const filePath = path.join(
            __dirname,
            `../../data/${res.locals.user.userId}/${req.params.pageId}/${req.body.filename}`
        );
        await fs.remove(filePath);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: '删除失败' });
    }
});

module.exports = router;