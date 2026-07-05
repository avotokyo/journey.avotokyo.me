import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Button, Descriptions, Drawer, Layout, Result, Tabs } from "antd";
import { getAllJourneys, getJourneyById, getSiteProfile } from "../data/index.ts";
import Sidebar from "../components/Sidebar.tsx";
import JourneyMap, { type JourneyMapRef } from "../components/JourneyMap.tsx";
import JourneyTimeline from "../components/JourneyTimeline.tsx";
import RoutePanel from "../components/RoutePanel.tsx";
import PhotoGallery from "../components/PhotoGallery.tsx";
import SharePanel from "../components/SharePanel.tsx";

export default function JourneyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mapRef = useRef<JourneyMapRef>(null);
  const journey = id ? getJourneyById(id) : undefined;

  if (!journey) {
    return (
      <Layout className="map-app">
        <Layout.Content>
          <Result
            status="warning"
            title="未找到旅行记录"
            subTitle={`找不到 ID 为 "${id}" 的旅程。`}
            extra={
              <Button type="primary" onClick={() => navigate("/")}>
                返回地图
              </Button>
            }
          />
        </Layout.Content>
      </Layout>
    );
  }

  const tabItems = [
    {
      key: "timeline",
      label: "时间线",
      children: (
        <JourneyTimeline
          journey={journey}
          onSelect={(wp) => mapRef.current?.focusWaypoint(wp.id)}
        />
      ),
    },
    {
      key: "routes",
      label: "路线",
      children: <RoutePanel journey={journey} />,
    },
    {
      key: "photos",
      label: "照片",
      children: <PhotoGallery journey={journey} />,
    },
  ];

  return (
    <Layout className="map-app">
      <Sidebar profile={getSiteProfile()} journeys={getAllJourneys()} />
      <Layout.Content className="map-stage">
        <JourneyMap ref={mapRef} journey={journey} />
        <Drawer
          open
          placement="right"
          width={380}
          mask={false}
          closable={false}
          rootClassName="detail-drawer"
          title={journey.title}
          extra={<SharePanel journey={journey} />}
        >
          <Breadcrumb
            style={{ marginBottom: 16 }}
            items={[{ title: <a onClick={() => navigate("/")}>地图</a> }, { title: journey.title }]}
          />
          <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="日期">
              {journey.startDate} — {journey.endDate}
            </Descriptions.Item>
            {journey.description && (
              <Descriptions.Item label="简介">{journey.description}</Descriptions.Item>
            )}
          </Descriptions>
          <Tabs items={tabItems} />
        </Drawer>
      </Layout.Content>
    </Layout>
  );
}
