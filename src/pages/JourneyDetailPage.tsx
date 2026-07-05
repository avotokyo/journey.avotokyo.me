import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Card, Layout, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getAllJourneys, getJourneyById, getSiteProfile } from "../data/index.ts";
import Sidebar from "../components/Sidebar.tsx";
import JourneyMap, { type JourneyMapRef } from "../components/JourneyMap.tsx";
import JourneyTimeline from "../components/JourneyTimeline.tsx";
import RoutePanel from "../components/RoutePanel.tsx";
import PhotoGallery from "../components/PhotoGallery.tsx";
import SharePanel from "../components/SharePanel.tsx";

const { Title, Paragraph, Text } = Typography;

export default function JourneyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const mapRef = useRef<JourneyMapRef>(null);
  const journey = id ? getJourneyById(id) : undefined;

  if (!journey) {
    return (
      <Layout className="map-app">
        <Layout.Content className="not-found">
          <Title level={3}>未找到旅行记录</Title>
          <Paragraph type="secondary">找不到 ID 为 "{id}" 的旅程。</Paragraph>
          <Link to="/">
            <Button type="primary">返回地图</Button>
          </Link>
        </Layout.Content>
      </Layout>
    );
  }

  return (
    <Layout className="map-app">
      <Sidebar profile={getSiteProfile()} journeys={getAllJourneys()} />
      <Layout.Content className="map-stage">
        <JourneyMap ref={mapRef} journey={journey} />
        <Card className="detail-panel" bordered={false}>
          <Link to="/" className="back-link">
            <ArrowLeftOutlined /> 地图
          </Link>
          <Title level={4}>{journey.title}</Title>
          <Text type="secondary">
            {journey.startDate} — {journey.endDate}
          </Text>
          {journey.description && (
            <Paragraph type="secondary" className="journey-desc">
              {journey.description}
            </Paragraph>
          )}
          <SharePanel journey={journey} />
          <div className="detail-panel-body">
            <JourneyTimeline
              journey={journey}
              onSelect={(wp) => mapRef.current?.focusWaypoint(wp.id)}
            />
            <RoutePanel journey={journey} />
            <PhotoGallery journey={journey} />
          </div>
        </Card>
      </Layout.Content>
    </Layout>
  );
}
