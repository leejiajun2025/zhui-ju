# 追剧导航 V2.0

轻量静态资源站导航，支持收藏、深色模式和最近 5 条观看记录。无需 Docker、数据库或服务器。

## 本地运行

```bash
npm install
npm run dev
```

构建：`npm run build`；Cloudflare Pages 构建命令 `npm run build`，输出目录 `dist`。

## 最近观看

点击「保存观看页面」，手动填写影视名称、可选集数及完整 HTTP(S) 播放页面 URL。支持继续观看、编辑、删除；最多保留最近保存或点击的 5 条。数据仅保存在当前浏览器 localStorage（`moviehub:watch-history`），不同设备不同步，清除站点数据会丢失。由于跨域限制，无法自动读取第三方播放页或播放进度。

## 数据更新

资源站入口在 `public/data.json`；GitHub Actions 使用 `scripts/sync.mjs` 每日更新选定站点的目录数据。同步的是导航信息，不保证站点始终可访问。

本站不提供影片聚合搜索或视频播放。请遵守第三方网站条款及内容版权要求。
