const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { 
    title: 'MCSMANAGER', 
    features: [
      '免费，易用，现代化的游戏服务器管理面板',
      '支持 Minecraft 和 Steam 游戏服务器',
      '多用户管理和资源分配',
      '可拖拽，卡片化的面板网页',
      '支持分布式，连接多台机器',
      '安装简单，一键快速开服',
      '支持运行所有 Docker Hub 镜像'
    ]
  });
});

module.exports = router;
