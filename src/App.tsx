import {
  Col,
  Descriptions,
  Drawer,
  Empty,
  Flex,
  Image,
  Layout,
  Menu,
  Row,
  Typography,
  message,
} from "antd";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { WorldMapController } from "./amap";
import {
  closeSpot,
  formatSpotDateTime,
  getSpotById,
  getSpotIdFromHash,
  groupSpotsByDate,
  openSpot,
  spots,
  subscribeSpotId,
  type Spot,
} from "./data/spots";

const { Text, Title, Paragraph, Link } = Typography;

export default function App() {
  const spotId = useSyncExternalStore(subscribeSpotId, getSpotIdFromHash);
  const activeSpot = spotId ? getSpotById(spotId) : undefined;
  const [overviewTick, setOverviewTick] = useState(0);

  const groups = groupSpotsByDate(spots);
  const sortedDates = [...groups.keys()].sort((a, b) => b.localeCompare(a));
  const menuItems = sortedDates.map((date) => ({
    type: "group" as const,
    label: date,
    children: groups.get(date)!.map((spot) => ({
      key: spot.id,
      label: spot.name,
      extra: (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {spot.time ?? ""}
        </Text>
      ),
    })),
  }));

  const copyLink = async () => {
    if (!activeSpot) return;
    const url = `${location.origin}${location.pathname}#/spot/${activeSpot.id}`;
    await navigator.clipboard.writeText(url);
    message.success("链接已复制");
  };

  const handleSpotClick = useCallback((spot: Spot) => openSpot(spot.id), []);

  const goHome = () => {
    if (spotId) closeSpot();
    else setOverviewTick((t) => t + 1);
  };

  return (
    <Layout className="map-app">
      <Layout.Sider width={300} className="app-sidebar" theme="light">
        <Flex vertical gap={16} className="sidebar-inner">
          <Title level={4} className="site-title" onClick={goHome}>
            牛油果旅行记✈️
          </Title>
          <Menu
            mode="inline"
            selectedKeys={spotId ? [spotId] : []}
            items={menuItems}
            onClick={({ key }) => openSpot(String(key))}
          />
        </Flex>
      </Layout.Sider>

      <Layout.Content className="map-stage">
        <WorldMap
          activeSpot={activeSpot}
          overviewTick={overviewTick}
          onSpotClick={handleSpotClick}
        />

        <Drawer
          open={!!activeSpot}
          onClose={closeSpot}
          placement="right"
          width={380}
          mask={false}
          rootClassName="detail-drawer"
          title={activeSpot?.name}
          footer={activeSpot ? <Link onClick={() => void copyLink()}>复制链接</Link> : null}
        >
          {activeSpot && (
            <>
              <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
                <Descriptions.Item label="时间">{formatSpotDateTime(activeSpot)}</Descriptions.Item>
                {activeSpot.address && (
                  <Descriptions.Item label="地址">{activeSpot.address}</Descriptions.Item>
                )}
              </Descriptions>

              {activeSpot.essay && (
                <>
                  <Title level={5}>随笔</Title>
                  <Paragraph>{activeSpot.essay}</Paragraph>
                </>
              )}

              {activeSpot.photos && activeSpot.photos.length > 0 ? (
                <>
                  <Title level={5} style={{ marginTop: 16 }}>
                    照片
                  </Title>
                  <Image.PreviewGroup>
                    <Row gutter={[8, 8]}>
                      {activeSpot.photos.map((src) => (
                        <Col span={12} key={src}>
                          <Image src={src} alt={activeSpot.name} style={{ borderRadius: 8 }} />
                        </Col>
                      ))}
                    </Row>
                  </Image.PreviewGroup>
                </>
              ) : (
                !activeSpot.essay && (
                  <Empty description="暂无照片与随笔" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )
              )}
            </>
          )}
        </Drawer>
      </Layout.Content>
    </Layout>
  );
}

function WorldMap({
  activeSpot,
  overviewTick,
  onSpotClick,
}: {
  activeSpot?: Spot;
  overviewTick: number;
  onSpotClick: (spot: Spot) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<WorldMapController | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const controller = new WorldMapController();
    controllerRef.current = controller;
    let cancelled = false;

    void controller.init(container, spots, onSpotClick).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
      controller.destroy();
      controllerRef.current = null;
      setReady(false);
    };
  }, [onSpotClick]);

  useEffect(() => {
    if (!ready) return;
    const controller = controllerRef.current;
    if (!controller) return;
    if (activeSpot) controller.focusSpot(activeSpot);
    else controller.showOverview();
  }, [ready, activeSpot]);

  useEffect(() => {
    if (!ready || overviewTick === 0) return;
    controllerRef.current?.showOverview();
  }, [ready, overviewTick]);

  return <div ref={containerRef} className="world-map" />;
}
