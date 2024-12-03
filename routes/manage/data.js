const express = require('express');
const router = express.Router();
const Visit = require('../../models/visit');
const Link = require('../../models/link');
const Page = require('../../models/page');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

// 添加 UA 解析函数
function parseBrowserInfo(ua) {
  if (!ua) return '未知浏览器';

  const parser = new UAParser(ua);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  return `${browser.name || '未知'} ${browser.version || ''} / ${os.name || '未知'}`;
}

// 添加 IP 地理位置解析函数
function getIpLocation(ip) {
  if (!ip || ip === '::1' || ip.includes('127.0.0.1')) {
    return '本地';
  }

  // 如果是 IPv6 格式需要特殊处理
  if (ip.includes('::ffff:')) {
    ip = ip.split('::ffff:')[1];
  }

  const geo = geoip.lookup(ip);
  if (!geo) {
    return '未知';
  }

  return `${geo.country || ''} ${geo.region || ''} ${geo.city || ''}`.trim();
}

// 添加数据分析页面路由
router.get('/', (req, res) => {
  res.render('manage/pages/data', {
    currentPage: 'data',
    username: res.locals.user.username
  });
});

// 获取所有分享链接
router.get('/links', async (req, res) => {
  try {
    const links = await Link.find({
      pageId: { $in: await Page.find({ userId: res.locals.user.userId }).distinct('pageId') }
    }).populate('pageId'); // 获取完整的link信息包括备注
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: '获取链接列表失败' });
  }
});

// 修改 data.js 中的树状图数据路由
router.get('/tree/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;

    // 修改查询以包含 ipAddress 和 browserInfo
    const visits = await Visit.find({ linkId })
      .populate('guest', 'ipAddress browserInfo') // 添加此行来关联 guest 信息
      .select('guestId parentGuestId timestamp depth ancestors')
      .sort('timestamp')
      .lean();

    console.log('Found visits:', visits);
    if (!visits || visits.length === 0) {
      return res.json({
        id: 'root',
        name: '暂无',
        children: []
      });
    }

    // 构建树形结构
    const treeData = {
      id: 'root',
      name: '链接',
      children: []
    };

    // 使用 Map 优化节点查找
    const nodeMap = new Map();

    // 按深度排序访问记录
    const sortedVisits = visits.sort((a, b) => a.depth - b.depth);

    sortedVisits.forEach(visit => {
      const ipLocation = getIpLocation(visit.guest?.ipAddress);
      const node = {
        id: visit.guestId,
        name: `${visit.guestId.slice(-8)}`,
        time: visit.timestamp,
        depth: visit.depth,
        ancestors: visit.ancestors,
        ipAddress: `${visit.guest?.ipAddress || '未知'} (${ipLocation})`,
        browserInfo: parseBrowserInfo(visit.guest?.browserInfo),
        children: []
      };

      nodeMap.set(visit.guestId, node);

      // 修改这里的逻辑：如果 parentGuestId 等于 guestId，直接添加到根节点
      if (visit.parentGuestId === visit.guestId || !visit.parentGuestId) {
        treeData.children.push(node);
      } else if (nodeMap.has(visit.parentGuestId)) {
        // 否则添加到父节点的子节点列表
        nodeMap.get(visit.parentGuestId).children.push(node);
      }
    });

    // 添加统计信息
    treeData.totalVisits = visits.length;
    treeData.maxDepth = Math.max(...visits.map(v => v.depth));

    console.log('Tree data generated:', {
      totalNodes: visits.length,
      rootChildren: treeData.children.length,
      maxDepth: treeData.maxDepth
    });

    return res.json(treeData);
  } catch (err) {
    console.error('Error generating tree data:', err);
    return res.status(500).json({
      error: '获取数据失败',
      message: err.message
    });
  }
});

// 在 data.js 中添加仪表盘统计数据路由
router.get('/dashboard-stats', async (req, res) => {
  try {
    // 获取用户的页面ID列表
    const userPageIds = await Page.find({
      userId: res.locals.user.userId
    }).distinct('pageId');

    // 并行获取统计数据
    const [linkCount, pageCount] = await Promise.all([
      // 获取链接总数
      Link.countDocuments({
        pageId: { $in: userPageIds }
      }),
      // 获取页面总数
      Page.countDocuments({
        userId: res.locals.user.userId
      })
    ]);

    res.json({
      linkCount,
      pageCount
    });
  } catch (err) {
    console.error('获取统计数据失败:', err);
    res.status(500).json({
      error: '获取统计数据失败',
      message: err.message
    });
  }
});

module.exports = router;