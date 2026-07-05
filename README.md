# 牛油果旅行记

个人旅行地图：在地图上浏览景点，查看随笔与照片。站点：[journey.avotokyo.me](https://journey.avotokyo.me)

## 功能

- 侧栏按日期分组浏览景点，点击聚焦地图并打开详情抽屉
- 地图使用高德 `CircleMarker` 标记景点，支持中国全景 / 街道级聚焦
- 详情抽屉展示时间、地址、随笔与照片，可复制深链接（`#/spot/:id`）
- 点击标题回到地图全景

## 技术栈

React 19 · TypeScript · Vite+ · Ant Design 6 · 高德地图 JS API 2.0

UI 遵循 Ant Design 默认 design token（`ConfigProvider` + `AntApp`），无自定义主题色。

## 项目结构

```
src/
├── main.tsx      # 入口，ConfigProvider 中文 locale
├── App.tsx       # 侧栏、地图、详情抽屉
├── amap.ts       # 高德地图封装（CircleMarker、视图切换）
└── data/
    ├── spots.json  # 景点数据
    └── spots.ts    # 类型、排序、Hash 路由
```

选中状态由 URL Hash（`#/spot/:id`）驱动，无需路由库。

## 本地开发

```bash
vp install
cp .env.example .env   # 填入高德 Web 端 JS API Key
vp run dev
```

其他命令：

```bash
vp run build     # 类型检查 + 生产构建
vp run preview   # 预览构建产物
```

景点数据编辑 `src/data/spots.json`，字段说明见 `src/data/spots.ts` 中的 `Spot` 接口。

## 部署

推送到 `main` 分支后，GitHub Actions 自动构建并发布到 GitHub Pages。需在仓库 Secrets 中配置 `VITE_AMAP_KEY`（与本地 `.env` 相同）。
