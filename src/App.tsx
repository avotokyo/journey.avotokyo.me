/**
 * 应用主界面。
 *
 * 布局：侧栏（左，按日期分组）| 地图 + 浮动详情抽屉（右）
 *
 * 状态管理：
 * - 当前选中景点由 URL Hash（#/spot/:id）驱动，通过 useSyncExternalStore 订阅
 * - overviewTick 用于点击标题时触发地图回到全景（即使 Hash 未变化）
 */
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
  Space,
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
  // 从 Hash 读取当前选中景点 id，Hash 变化时自动重渲染
  const spotId = useSyncExternalStore(subscribeSpotId, getSpotIdFromHash);
  const activeSpot = spotId ? getSpotById(spotId) : undefined;

  // 递增此值可触发地图回到全景，用于点击标题「回到首页」
  const [overviewTick, setOverviewTick] = useState(0);

  // 构建侧栏菜单：按日期分组，日期倒序（最新在上），组内景点按时间升序
  const groups = groupSpotsByDate(spots);
  const sortedDates = [...groups.keys()].sort((a, b) => b.localeCompare(a));
  const menuItems = sortedDates.map((date) => ({
    type: "group" as const,
    label: date,
    children: groups.get(date)!.map((spot) => ({
      key: spot.id,
      label: spot.name,
      extra: <Text type="secondary">{spot.time ?? ""}</Text>,
    })),
  }));

  /** 复制当前景点的深链接到剪贴板 */
  const copyLink = async () => {
    if (!activeSpot) return;
    const url = `${location.origin}${location.pathname}#/spot/${activeSpot.id}`;
    await navigator.clipboard.writeText(url);
    message.success("链接已复制");
  };

  const handleSpotClick = useCallback((spot: Spot) => openSpot(spot.id), []);

  /** 点击标题：关闭详情抽屉并回到地图全景 */
  const goHome = () => {
    if (spotId) closeSpot();
    setOverviewTick((t) => t + 1);
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Layout.Sider width={300} theme="light" style={{ overflow: "auto", padding: "24px 12px" }}>
        <Flex vertical gap={16}>
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

      <Layout style={{ flex: 1, minHeight: 0 }}>
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
            width={380}
            mask={false}
            getContainer={false}
            rootStyle={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            styles={{ wrapper: { pointerEvents: "auto" } }}
            title={activeSpot?.name}
            footer={activeSpot ? <Link onClick={() => void copyLink()}>复制链接</Link> : null}
          >
            {activeSpot && (
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="时间">
                    {formatSpotDateTime(activeSpot)}
                  </Descriptions.Item>
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
                    <Title level={5}>照片</Title>
                    <Image.PreviewGroup>
                      <Row gutter={[8, 8]}>
                        {activeSpot.photos.map((src) => (
                          <Col span={12} key={src}>
                            <Image src={src} alt={activeSpot.name} />
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
              </Space>
            )}
          </Drawer>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

/**
 * 地图 React 封装组件。
 *
 * 负责 WorldMapController 的生命周期管理：
 * - 挂载时初始化地图，卸载时销毁
 * - activeSpot 变化时聚焦对应景点
 * - overviewTick 变化时回到中国全景
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
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<WorldMapController | null>(null);
  const [ready, setReady] = useState(false);

  // 初始化地图控制器，组件卸载时清理
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

  // 选中景点变化时，地图聚焦到该景点
  useEffect(() => {
    if (!ready || !activeSpot) return;
    controllerRef.current?.focusSpot(activeSpot);
  }, [ready, activeSpot]);

  // overviewTick > 0 时回到全景（tick 为 0 表示初始状态，跳过）
  useEffect(() => {
    if (!ready || overviewTick === 0) return;
    controllerRef.current?.showOverview();
  }, [ready, overviewTick]);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}
