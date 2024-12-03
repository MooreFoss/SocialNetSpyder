const express = require('express');
const router = express.Router();
const Link = require('../models/link');
const Visit = require('../models/visit');
const Guest = require('../models/guests');
const Page = require('../models/page');
const path = require('path');

// 在文件开头添加函数
async function incrementVisitCount(linkId) {
    try {
        await Link.findOneAndUpdate(
            { linkId },
            { $inc: { visitCount: 1 } },
            { new: true }
        );
    } catch (err) {
        console.error('增加访问计数失败:', err);
    }
}

// 修改 isFirstVisit 函数为 shouldRecordVisit
async function shouldRecordVisit(linkId, guestId, currentParentGuestId) {
    try {
        const existingVisit = await Visit.findOne({
            linkId,
            guestId
        });
        
        // 如果没有访问记录，应该记录
        if (!existingVisit) {
            return true;
        }
        
        // 如果有访问记录，但父级访客ID不同，也应该记录
        if (existingVisit.parentGuestId !== currentParentGuestId) {
            return true;
        }
        
        return false;
    } catch (err) {
        console.error('检查访问记录失败:', err);
        return false;
    }
}

router.get('/:linkId', async (req, res) => {
    try {
        const { linkId } = req.params;
        const { guestId: parentGuestId } = req.query;
        console.log('访问参数:', { linkId, parentGuestId });

        const link = await Link.findOne({ linkId, isActive: true });
        if (!link) {
            return res.status(404).render('404');
        }

        let guestId = req.cookies.guestId;
        const isNewVisitor = !guestId;
        console.log('访客信息:', { guestId, isNewVisitor });

        if (isNewVisitor) {
            const guest = new Guest({
                ipAddress: req.ip,
                browserInfo: req.headers['user-agent']
            });

            const savedGuest = await guest.save();
            guestId = savedGuest.guestId;

            res.cookie('guestId', guestId, {
                maxAge: 365 * 24 * 60 * 60 * 1000,
                httpOnly: true
            });
        }

        // 提前进行URL重定向检查
        const shouldRedirect = isNewVisitor || guestId !== parentGuestId;
        console.log('重定向检查:', { shouldRedirect, guestId, parentGuestId });

        if (shouldRedirect) {
            // 检查是否需要记录访问
            const shouldRecord = await shouldRecordVisit(linkId, guestId, parentGuestId);
            console.log('是否需要记录访问:', shouldRecord);
            
            if (shouldRecord) {
                await incrementVisitCount(linkId);

                const guest = await Guest.create({
                    ipAddress: req.ip,
                    browserInfo: req.headers['user-agent']
                });

                await Visit.create({
                    linkId: linkId,
                    guestId: guestId,
                    parentGuestId: parentGuestId,
                    guest: guest._id
                });
            }

            const newUrl = `/s/${linkId}?guestId=${guestId}`;
            console.log('重定向到:', newUrl);
            return res.redirect(newUrl);
        }

        // 如果不需要重定向,直接显示页面
        const page = await Page.findOne({ pageId: link.pageId });
        if (!page) {
            return res.status(404).render('404');
        }

        // 根据页面类型返回响应
        if (page.type === 'link') {
            return res.render('iframe', {
                title: page.title,
                url: page.content
            });
        } else {
            const filePath = path.join(__dirname, `../data/${page.userId}/${page.pageId}/index.html`);
            return res.sendFile(filePath, err => {
                if (err) {
                    res.status(404).render('404');
                }
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('error', {
            message: '服务器错误',
            error: {}
        });
    }
});

module.exports = router;