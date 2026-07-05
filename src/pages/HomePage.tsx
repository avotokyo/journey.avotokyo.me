import { useMemo } from "react";
import { Layout } from "antd";
import { getAllJourneys, getAllMapPoints, getSiteProfile } from "../data/index.ts";
import Sidebar from "../components/Sidebar.tsx";
import WorldMap from "../components/WorldMap.tsx";

export default function HomePage() {
  const profile = getSiteProfile();
  const journeys = getAllJourneys();
  const points = useMemo(() => getAllMapPoints(), []);

  return (
    <Layout className="map-app">
      <Sidebar profile={profile} journeys={journeys} />
      <Layout.Content className="map-stage">
        <WorldMap points={points} />
      </Layout.Content>
    </Layout>
  );
}
