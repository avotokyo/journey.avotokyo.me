/**
 * 应用主界面。
 *
 * 布局遵循 Ant Design v6 三层表面模型：
 *   - `Layout.Header`：品牌 + 右侧旅程概览统计条（bg-container + 底边框）
 *   - `Layout.Sider`：按日期分组的景点导航 + 底部足迹计数（bg-container + 右边框）
 *   - `Layout.Content`：地图 + 悬浮详情抽屉（bg-layout；抽屉为 elevated，带阴影）
 *
 * 视觉纪律（对齐 Ant Design v6 规范）：
 *   - 主功能色仅出现在唯一 primary 按钮（复制链接）与地图标记高亮
 *   - 分类可视化用预设色（geekblue/gold/purple…），见 `components/tagColors.ts`
 *   - 只使用 400/600 两种字重；间距全部走 `token.margin*` / `token.padding*`
 *   - 层级由边框、Divider 和淡色底 (`colorFillQuaternary`) 承担，避免多余阴影
 *
 * 状态：
 *   - 选中景点由 URL Hash（`#/spot/:id`）驱动，`useSyncExternalStore` 订阅
 *   - `overviewTick` 在 Hash 未变时触发地图回到全景（如点击品牌名）
 */
import { App as AntApp, Alert, Layout, theme } from "antd";
import { useCallback, useState, useSyncExternalStore } from "react";

import { AppHeader } from "./components/AppHeader";
import { JourneySider } from "./components/JourneySider";
import { SpotDrawer } from "./components/SpotDrawer";
import { WorldMap } from "./components/WorldMap";
import {
  closeSpot,
  getSpotById,
  getSpotIdFromHash,
  journeyStats,
  openSpot,
  subscribeSpotId,
  type Spot,
} from "./data/spots";

export default function App() {
  const { token } = theme.useToken();
  const { message } = AntApp.useApp();

  const spotId = useSyncExternalStore(subscribeSpotId, getSpotIdFromHash);
  const activeSpot = spotId ? getSpotById(spotId) : undefined;

  const [overviewTick, setOverviewTick] = useState(0);

  const copyLink = async () => {
    if (!activeSpot) return;
    const url = `${location.origin}${location.pathname}#/spot/${activeSpot.id}`;
    await navigator.clipboard.writeText(url);
    message.success("链接已复制");
  };

  const handleSpotClick = useCallback((spot: Spot) => openSpot(spot.id), []);

  const goHome = () => {
    if (spotId) closeSpot();
    setOverviewTick((t) => t + 1);
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden", background: token.colorBgLayout }}>
      <AppHeader stats={journeyStats} onGoHome={goHome} />

      <Layout>
        <JourneySider spotId={spotId} />

        <Layout style={{ flex: 1, minHeight: 0, background: token.colorBgLayout }}>
          <Layout.Content
            style={{ position: "relative", padding: 0, height: "100%", overflow: "hidden" }}
          >
            <WorldMap
              activeSpot={activeSpot}
              overviewTick={overviewTick}
              onSpotClick={handleSpotClick}
            />

            {!activeSpot && (
              <Alert
                type="info"
                showIcon
                message="点击地图上的标记，或从左侧列表选择景点，查看随笔与照片。"
                style={{
                  position: "absolute",
                  top: token.margin,
                  left: token.margin,
                  right: token.margin,
                  maxWidth: 460,
                  boxShadow: token.boxShadowTertiary,
                }}
                closable
              />
            )}

            <SpotDrawer spot={activeSpot} onClose={closeSpot} onCopyLink={() => void copyLink()} />
          </Layout.Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
