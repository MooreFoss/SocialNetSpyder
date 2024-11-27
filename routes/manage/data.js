const express = require('express');
const router = express.Router();
const Visit = require('../../models/visit');
const Link = require('../../models/link');
const Page = require('../../models/page');

// 修改 buildVisitTree 函数
function buildVisitTree(visits) {
  const nodeMap = new Map();
  
  const root = {
    id: 'root',
    visitCount: 0,
    children: []
  };
  nodeMap.set('root', root);

  visits.sort((a, b) => a.timestamp - b.timestamp);

  // 创建节点时保留完整访问信息
  visits.forEach(visit => {
    const node = {
      id: visit.guestId,
      guestId: visit.guestId,
      timestamp: visit.timestamp,
      ipAddress: visit.ipAddress,
      userAgent: visit.userAgent,
      depth: visit.depth,
      visitCount: 1,
      children: []
    };
    nodeMap.set(visit.guestId, node);
  });

  visits.forEach(visit => {
    const node = nodeMap.get(visit.guestId);
    const parentId = visit.parentGuestId || 'root';
    const parentNode = nodeMap.get(parentId);
    
    if (parentNode) {
      parentNode.children.push(node);
    } else {
      root.children.push(node);
    }
  });

  return root;
}

router.get('/', (req, res) => {
  res.render('manage/pages/data', {
    currentPage: 'data',
    username: res.locals.user.username
  });
});

router.get('/shareAnalytics/:linkId', async (req, res) => {
  try {
    // 验证链接存在性和权限
    const link = await Link.findOne({ linkId: req.params.linkId });
    if (!link) {
      return res.status(404).json({ error: '分享链接不存在' });
    }

    const page = await Page.findOne({ 
      pageId: link.pageId,
      userId: res.locals.user.userId 
    });
    if (!page) {
      return res.status(403).json({ error: '无权限查看此数据' });
    }

    // 获取访问记录并构建树
    const visits = await Visit.find({ linkId: req.params.linkId })
      .select('guestId parentGuestId timestamp depth ipAddress userAgent')
      .sort('timestamp');
    
    console.log(`Found ${visits.length} visits for link ${req.params.linkId}`);
    
    const treeData = buildVisitTree(visits);
    
    // 添加基本统计信息
    const stats = {
      totalVisits: visits.length,
      uniqueVisitors: new Set(visits.map(v => v.guestId)).size,
      maxDepth: Math.max(0, ...visits.map(v => v.depth || 0)),
      startTime: visits[0]?.timestamp,
      endTime: visits[visits.length - 1]?.timestamp
    };

    res.json({
      tree: treeData,
      stats: stats
    });
  } catch (err) {
    console.error('访问分析数据获取失败:', err);
    res.status(500).json({ error: '获取分析数据失败' });
  }
});

// routes/manage/data.js - 添加新的API端点
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [linkCount, pageCount] = await Promise.all([
      Link.countDocuments(),
      Page.countDocuments({ userId: res.locals.user.userId })
    ]);
    
    res.json({
      linkCount,
      pageCount
    });
  } catch (err) {
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

module.exports = router;