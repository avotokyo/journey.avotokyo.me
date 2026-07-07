/**
 * 应用主界面（Container）。
 *
 * 组装 journey 数据与 useJourneySelection 路由状态，将 props 下发给各 Presenter 组件。
 */
import { App as AntApp, Alert, Layout, theme } from "antd";
import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { AppHeader } from "./components/AppHeader";
import { JourneySider } from "./components/JourneySider";
import { SpotDrawer } from "./components/SpotDrawer";
import { WorldMap, type WorldMapHandle } from "./components/WorldMap";
import { journey } from "./data";
import { useJourneySelection } from "./useJourneySelection";

const { spots, dayGroups, stats } = journey;

export default function App() {
  const { token } = theme.useToken();
  const { message } = AntApp.useApp();
  const navigate = useNavigate();
  const mapRef = useRef<WorldMapHandle>(null);
  const { spotId, activeSpot, selectSpot, closeSelection } = useJourneySelection(journey.getById);

  const goHome = useCallback(() => {
    if (spotId) void navigate("/");
    mapRef.current?.showOverview();
  }, [spotId, navigate]);

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
          stats={stats}
          onSelectSpot={selectSpot}
        />

        <Layout style={{ flex: 1, minHeight: 0, background: token.colorBgLayout }}>
          <Layout.Content
            style={{ position: "relative", padding: 0, height: "100%", overflow: "hidden" }}
          >
            <WorldMap
              ref={mapRef}
              spots={spots}
              activeSpot={activeSpot}
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
