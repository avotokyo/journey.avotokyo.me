import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "antd";
import { getAllSpots, getSiteProfile, getSpotById } from "../data/index.ts";
import Sidebar from "../components/Sidebar.tsx";
import WorldMap from "../components/WorldMap.tsx";
import SpotDetailDrawer from "../components/SpotDetailDrawer.tsx";

export default function HomePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = getSiteProfile();
  const spots = useMemo(() => getAllSpots(), []);
  const activeSpot = id ? getSpotById(id) : undefined;

  const handleSpotClick = useCallback(
    (spot: { id: string }) => navigate(`/spot/${spot.id}`),
    [navigate],
  );

  const handleClose = useCallback(() => navigate("/"), [navigate]);

  return (
    <Layout className="map-app">
      <Sidebar profile={profile} spots={spots} />
      <Layout.Content className="map-stage">
        <WorldMap spots={spots} onSpotClick={handleSpotClick} />
        <SpotDetailDrawer spot={activeSpot} open={!!activeSpot} onClose={handleClose} />
      </Layout.Content>
    </Layout>
  );
}
