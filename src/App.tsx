/**
 * 应用主界面（Container）。
 *
 * 组装 journeyRepository 数据与 useJourneySelection 状态，
 * 将 props 下发给各 Presenter 组件。
 */
import { App as AntApp, Alert, Layout, theme } from "antd";

import { AppHeader } from "./components/AppHeader";
import { JourneySider } from "./components/JourneySider";
import { SpotDrawer } from "./components/SpotDrawer";
import { WorldMap } from "./components/WorldMap";
import { journeyRepository } from "./data/journeyRepository";
import { useJourneySelection } from "./hooks/useJourneySelection";

const { spots, dayGroups, stats } = journeyRepository;

export default function App() {
  const { token } = theme.useToken();
  const { message } = AntApp.useApp();
  const { spotId, activeSpot, overviewTick, selectSpot, closeSelection, goHome } =
    useJourneySelection();

  const copyLink = async () => {
    if (!activeSpot) return;
    await navigator.clipboard.writeText(
      `${window.location.origin}${window.location.pathname}#/spot/${activeSpot.id}`,
    );
    message.success("链接已复制");
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden", background: token.colorBgLayout }}>
      <AppHeader stats={stats} onGoHome={goHome} />

      <Layout>
        <JourneySider
          spotId={spotId}
          dayGroups={dayGroups}
          totalSpots={stats.totalSpots}
          onSelectSpot={selectSpot}
        />

        <Layout style={{ flex: 1, minHeight: 0, background: token.colorBgLayout }}>
          <Layout.Content
            style={{ position: "relative", padding: 0, height: "100%", overflow: "hidden" }}
          >
            <WorldMap
              spots={spots}
              activeSpot={activeSpot}
              overviewTick={overviewTick}
              onSelectSpot={selectSpot}
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

            <SpotDrawer
              spot={activeSpot}
              onClose={closeSelection}
              onCopyLink={() => void copyLink()}
            />
          </Layout.Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
