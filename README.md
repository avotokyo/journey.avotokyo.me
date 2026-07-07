# 牛油果旅行记

个人旅行地图：在地图上浏览景点，查看随笔、照片、花费与感受。站点：[journey.avotokyo.me](https://journey.avotokyo.me)

## 功能

- **旅程概览**：顶栏实时展示景点数、城市数、天数、总花费四项统计
- **按日分组导航**：侧栏 Menu 按日期倒序分组，日内按时间升序，每组标注当日城市
- **地图标记**：高德 `CircleMarker` 标注景点，支持中国全景 ↔ 街道级聚焦切换
- **详情抽屉**：评分（`Rate`）、分类标签、天气/同行/花费元信息卡、随笔、4:3 照片网格
- **深链接分享**：react-router-dom `HashRouter`（`#/spot/:id`）驱动选中态，可复制单个景点的可分享链接
- **无遮罩抽屉**：详情抽屉悬浮于地图之上，地图仍可交互

## 项目结构

```tree
src/
├── main.tsx                    # 入口：ConfigProvider + AntApp + HashRouter
├── App.tsx                     # Container：组装数据与状态，下发 props
├── constants.ts                # 布局常量（抽屉宽度等）
├── useJourneySelection.ts      # URL 选中态 Hook（解析 activeSpot、导航、无效 ID 重定向）
├── amap.ts                     # 高德地图 Adapter（CircleMarker、视图切换）
├── data/
│   ├── spots.json              # 景点数据源
│   └── index.ts                # 类型 + 派生逻辑 + journey Facade
└── components/                 # Presenter 组件（纯 props 驱动）
    ├── AppHeader.tsx
    ├── JourneyOverviewStrip.tsx
    ├── JourneySider.tsx
    ├── SpotDrawer.tsx
    ├── SpotDetailPanel.tsx
    ├── WorldMap.tsx
    └── tagColors.ts
```

选中状态由 react-router-dom `HashRouter` 驱动（`#/spot/:id`），适配 GitHub Pages 部署。

## 架构

采用扁平分层，各层职责单一、文件数尽量少：

| 模式             | 位置                       | 职责                                                      |
| ---------------- | -------------------------- | --------------------------------------------------------- |
| **Data Facade**  | `data/index.ts`            | 读取 `spots.json`，派生排序/分组/统计，对外暴露 `journey` |
| **Container**    | `App.tsx`                  | 组装数据与路由状态，组合 `goHome`（导航 + 地图复位）      |
| **URL-as-State** | `useJourneySelection.ts`   | 从 URL 解析 `activeSpot`，处理导航与无效 ID 重定向        |
| **Adapter**      | `amap.ts` + `WorldMap.tsx` | 封装高德 SDK；`forwardRef` 暴露 `showOverview()` 命令接口 |
| **Presenter**    | `components/*`             | 纯 props 驱动，不直接读取数据或操作路由                   |

数据流：用户点击侧栏/地图 → `selectSpot` 更新 URL → Hook 解析 `activeSpot` → Container 将 props 下发给地图与抽屉。

## 数据字段

`src/data/spots.json` 中每条景点支持以下字段（`id`/`name`/`location`/`date` 必填，其余可选，缺失时 UI 静默省略）：

| 字段         | 类型               | 说明                                                    |
| ------------ | ------------------ | ------------------------------------------------------- |
| `id`         | `string`           | 唯一标识，用于路由（`/spot/:id`）与菜单 key             |
| `name`       | `string`           | 景点名称                                                |
| `city`       | `string`           | 所属城市，用于统计与抽屉副标题                          |
| `address`    | `string`           | 详细地址                                                |
| `location`   | `[number, number]` | `[经度, 纬度]`                                          |
| `date`       | `string`           | 到访日期 `YYYY-MM-DD`                                   |
| `time`       | `string`           | 到访时间 `HH:mm`                                        |
| `essay`      | `string`           | 旅行随笔                                                |
| `photos`     | `string[]`         | 照片 URL 列表                                           |
| `weather`    | `string`           | 当日天气，如 `"晴 22℃"`                                 |
| `companions` | `string`           | 同行者，如 `"独自"`、`"与家人"`                         |
| `cost`       | `number`           | 花费（元），计入总花费（未录入视为 0）                  |
| `rating`     | `number`           | 主观评分 0–5，支持 0.5 递增                             |
| `tags`       | `string[]`         | 分类标签，映射到 Ant Design 预设色（见 `tagColors.ts`） |

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

新增标签类目时，请在 `src/components/tagColors.ts` 的 `TAG_COLOR_MAP` 中登记预设色映射，避免落回默认灰。

新增景点时，编辑 `src/data/spots.json` 即可，`data/index.ts` 会在构建时自动派生排序、分组与统计。

## 部署

推送到 `main` 分支后，GitHub Actions 自动构建并发布到 GitHub Pages。需在仓库 Secrets 中配置 `VITE_AMAP_KEY`（与本地 `.env` 相同）。
