import { Button, Layout, Result } from "antd";
import { useCallback, useMemo } from "react";
import { HashRouter, Route, Routes, useNavigate, useParams } from "react-router-dom";

import Sidebar from "./components/Sidebar.tsx";
import SpotDetailDrawer from "./components/SpotDetailDrawer.tsx";
import WorldMap from "./components/WorldMap.tsx";
import { getAllSpots, getSpotById, type SiteProfile, type Spot } from "./data/schema.ts";
import site from "./data/site.json";
import spotsData from "./data/spots.json";

function AppLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = site as SiteProfile;
  const spots = useMemo(() => getAllSpots(spotsData.spots as Spot[]), []);
  const activeSpot = id ? getSpotById(spots, id) : undefined;

  const handleSpotClick = useCallback(
    (spot: { id: string }) => navigate(`/spot/${spot.id}`),
    [navigate],
  );

  const handleClose = useCallback(() => navigate("/"), [navigate]);

  return (
    <Layout className="map-app">
      <Sidebar profile={profile} spots={spots} />
      <Layout.Content className="map-stage">
        <WorldMap spots={spots} activeSpot={activeSpot} onSpotClick={handleSpotClick} />
        <SpotDetailDrawer spot={activeSpot} open={!!activeSpot} onClose={handleClose} />
      </Layout.Content>
    </Layout>
  );
}

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Layout className="map-app">
      <Layout.Content>
        <Result
          status="404"
          title="404"
          subTitle="页面不存在"
          extra={
            <Button type="primary" onClick={() => navigate("/")}>
              返回首页
            </Button>
          }
        />
      </Layout.Content>
    </Layout>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />} />
        <Route path="/spot/:id" element={<AppLayout />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
}
