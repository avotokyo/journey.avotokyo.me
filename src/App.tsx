/**
 * 应用主界面。
 *
 * 布局：侧栏（按日期分组）| 地图 + 嵌入式详情抽屉（无遮罩，地图仍可交互）
 * 视觉：Ant Design 默认 token，三层表面（layout / container / 浮层）
 *
 * 状态：
 * - 选中景点由 URL Hash（#/spot/:id）驱动，useSyncExternalStore 订阅
 * - overviewTick 在 Hash 未变时触发地图回到全景（如点击标题）
 */
import {
  App as AntApp,
  Button,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Flex,
  Image,
  Layout,
  Menu,
  Row,
  Space,
  Typography,
  theme,
} from "antd";
import type { GlobalToken } from "antd/es/theme/interface";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { DRAWER_WIDTH, WorldMapController } from "./amap";
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
  const { token } = theme.useToken();
  const { message } = AntApp.useApp();

  const spotId = useSyncExternalStore(subscribeSpotId, getSpotIdFromHash);
  const activeSpot = spotId ? getSpotById(spotId) : undefined;

  const [overviewTick, setOverviewTick] = useState(0);

  const menuItems = useMemo(() => {
    const groups = groupSpotsByDate(spots);
    const sortedDates = [...groups.keys()].sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date) => ({
      type: "group" as const,
      label: <Text type="secondary">{date}</Text>,
      children: groups.get(date)!.map((spot) => ({
        key: spot.id,
        label: spot.name,
        extra: <Text type="secondary">{spot.time ?? ""}</Text>,
      })),
    }));
  }, []);

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
    <Layout
      style={{
        height: "100vh",
        overflow: "hidden",
        background: token.colorBgLayout,
      }}
    >
      <Layout.Sider
        width={300}
        theme="light"
        style={{
          overflow: "auto",
          padding: `${token.paddingLG}px ${token.paddingSM}px`,
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Flex vertical gap={token.margin}>
          <Title level={4} style={{ margin: 0 }}>
            <Link onClick={goHome}>牛油果旅行记 ᕕ( ᐛ )ᕗ ~</Link>
          </Title>
          <Menu
            mode="inline"
            selectedKeys={spotId ? [spotId] : []}
            items={menuItems}
            onClick={({ key }) => openSpot(String(key))}
          />
        </Flex>
      </Layout.Sider>

      <Layout style={{ flex: 1, minHeight: 0, background: token.colorBgLayout }}>
        <Layout.Content
          style={{ position: "relative", padding: 0, height: "100%", overflow: "hidden" }}
        >
          <WorldMap
            activeSpot={activeSpot}
            overviewTick={overviewTick}
            onSpotClick={handleSpotClick}
          />

          <Drawer
            open={!!activeSpot}
            onClose={closeSpot}
            placement="right"
            width={DRAWER_WIDTH}
            getContainer={false}
            rootStyle={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            styles={{
              wrapper: { pointerEvents: "auto" },
              header: { borderBottom: `1px solid ${token.colorBorderSecondary}` },
              body: {
                padding: `${token.paddingContentVerticalLG}px ${token.paddingLG}px`,
              },
              footer: { borderTop: `1px solid ${token.colorBorderSecondary}` },
            }}
            title={activeSpot?.name}
            footer={
              activeSpot ? (
                <Button type="primary" block onClick={() => void copyLink()}>
                  复制链接
                </Button>
              ) : null
            }
          >
            {activeSpot && <SpotDetailPanel spot={activeSpot} token={token} />}
          </Drawer>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

function SpotDetailPanel({ spot, token }: { spot: Spot; token: GlobalToken }) {
  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Descriptions column={1} size="small">
        <Descriptions.Item label="时间">{formatSpotDateTime(spot)}</Descriptions.Item>
        {spot.address && <Descriptions.Item label="地址">{spot.address}</Descriptions.Item>}
      </Descriptions>

      {spot.essay && (
        <>
          <Title level={5}>随笔</Title>
          <Paragraph>{spot.essay}</Paragraph>
        </>
      )}

      {spot.photos && spot.photos.length > 0 ? (
        <>
          <Title level={5}>照片</Title>
          <Image.PreviewGroup>
            <Row gutter={[8, 8]}>
              {spot.photos.map((src) => (
                <Col span={12} key={src}>
                  <Image src={src} alt={spot.name} style={{ borderRadius: token.borderRadiusLG }} />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </>
      ) : (
        !spot.essay && <Empty description="暂无照片与随笔" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Space>
  );
}

/**
 * 地图 React 封装：CircleMarker 标记 + token 配色，WorldMapController 管理生命周期。
 */
function WorldMap({
  activeSpot,
  overviewTick,
  onSpotClick,
}: {
  activeSpot?: Spot;
  overviewTick: number;
  onSpotClick: (spot: Spot) => void;
}) {
  const { token } = theme.useToken();
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<WorldMapController | null>(null);
  const [ready, setReady] = useState(false);

  const markerStyle = useMemo(
    () => ({
      fillColor: token.colorPrimary,
      activeFillColor: token.colorPrimaryActive,
      strokeColor: token.colorBgContainer,
    }),
    [token.colorPrimary, token.colorPrimaryActive, token.colorBgContainer],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const controller = new WorldMapController();
    controllerRef.current = controller;
    let cancelled = false;

    void controller.init(container, spots, markerStyle, onSpotClick).then(() => {
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
    controllerRef.current?.updateMarkerStyle(markerStyle);
  }, [ready, markerStyle]);

  useEffect(() => {
    if (!ready) return;
    controllerRef.current?.setActiveSpot(activeSpot?.id ?? null);
    if (!activeSpot) return;
    controllerRef.current?.focusSpot(activeSpot);
  }, [ready, activeSpot]);

  useEffect(() => {
    if (!ready || overviewTick === 0) return;
    controllerRef.current?.showOverview();
  }, [ready, overviewTick]);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}
