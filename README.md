# 牛油果旅行记

个人旅行地图，在地图上浏览景点，查看随笔与照片。站点：[journey.avotokyo.me](https://journey.avotokyo.me)

## 技术栈

React · TypeScript · Vite+ · Ant Design · 高德地图 JS API

## 本地开发

```bash
pnpm install
cp .env.example .env   # 填入高德 Web 端 JS API Key
pnpm dev
```

景点数据在 `src/data/spots.json`，字段说明见 `src/data/spots.ts`。

## 部署

推送到 `main` 分支后由 GitHub Actions 自动构建并发布到 GitHub Pages。需在仓库 Secrets 中配置 `VITE_AMAP_KEY`。
