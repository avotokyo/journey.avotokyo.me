/**
 * 应用主界面。
 *
 * 布局遵循 Ant Design v6 三层表面模型：
 *   - Layout.Header：品牌与旅程概览统计（bg-container，底边框）
 *   - Layout.Sider：按日期分组的景点导航（bg-container，右边框）
 *   - Layout.Content：地图与详情抽屉（bg-layout，抽屉悬浮为 elevated）
 *
 * 状态：
 * - 选中景点由 URL Hash（#/spot/:id）驱动，useSyncExternalStore 订阅
 * - overviewTick 在 Hash 未变时触发地图回到全景（如点击品牌名）
 */
import {
  CalendarOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  GithubOutlined,
  LinkOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import {
  App as AntApp,
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Flex,
  Image,
  Layout,
  Menu,
  Rate,
  Row,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import type { GlobalToken } from "antd/es/theme/interface";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { DRAWER_WIDTH, WorldMapController } from "./amap";
import {
  closeSpot,
  computeJourneyStats,
  formatSpotDateTime,
  getSpotById,
  getSpotIdFromHash,
  groupSpotsByDate,
  openSpot,
  spots,
  subscribeSpotId,
  type Spot,
} from "./data/spots";

const { Text, Paragraph, Link } = Typography;

/**
 * 标签分类 → Ant Design 预设色映射。
 *
 * 遵循 v6 规范：预设色（blue/gold/purple/…）只用于分类可视化，
 * 不作为主功能色。同一类目在不同景点保持同一颜色，帮助用户建立记忆。
 */
const TAG_COLOR_MAP: Record<string, string> = {
  历史: "geekblue",
  地标: "blue",
  博物馆: "purple",
  美食: "gold",
  园林: "green",
  皇家: "gold",
  湖景: "cyan",
  自然: "green",
  山林: "green",
  水利: "cyan",
  古城: "volcano",
  胡同: "volcano",
  文艺: "magenta",
  骑行: "lime",
  步行街: "orange",
  夜景: "purple",
  城市: "blue",
  公园: "green",
  宗教: "gold",
};

function tagColor(tag: string): string {
  return TAG_COLOR_MAP[tag] ?? "default";
}

export default function App() {
  const { token } = theme.useToken();
  const { message } = AntApp.useApp();

  const spotId = useSyncExternalStore(subscribeSpotId, getSpotIdFromHash);
  const activeSpot = spotId ? getSpotById(spotId) : undefined;

  const [overviewTick, setOverviewTick] = useState(0);

  const menuItems = useMemo(() => {
    const groups = groupSpotsByDate(spots);
    const sortedDates = [...groups.keys()].sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date) => {
      const group = groups.get(date)!;
      const cities = [...new Set(group.map((s) => s.city).filter(Boolean))].join(" · ");
      return {
        type: "group" as const,
        label: (
          <Flex align="center" gap={6}>
            <CalendarOutlined style={{ color: token.colorTextTertiary, fontSize: 12 }} />
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {date}
            </Text>
            {cities && (
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                · {cities}
              </Text>
            )}
          </Flex>
        ),
        children: group.map((spot) => ({
          key: spot.id,
          icon: <EnvironmentOutlined />,
          label: spot.name,
          extra: (
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {spot.time ?? ""}
            </Text>
          ),
        })),
      };
    });
  }, [token.colorTextTertiary, token.fontSizeSM]);

  const stats = useMemo(() => computeJourneyStats(spots), []);

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
    <Layout style={{ height: "100vh", overflow: "hidden", background: token.colorBgLayout }}>
      <Layout.Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
          padding: `0 ${token.paddingLG}px`,
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          lineHeight: "normal",
        }}
      >
        <Flex align="center" gap={token.marginXS}>
          <CompassOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
          <Link
            onClick={goHome}
            style={{ color: token.colorText, fontSize: token.fontSizeHeading5, fontWeight: 600 }}
          >
            牛油果旅行记
          </Link>
          <Text type="secondary" style={{ marginLeft: token.marginXS }}>
            ᕕ( ᐛ )ᕗ · 个人旅行地图
          </Text>
        </Flex>
        <JourneyOverviewStrip stats={stats} token={token} />
      </Layout.Header>

      <Layout>
        <Layout.Sider
          width={280}
          theme="light"
          style={{
            overflow: "auto",
            background: token.colorBgContainer,
            borderRight: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Flex vertical style={{ height: "100%" }}>
            <div style={{ flex: 1, paddingBlock: token.paddingSM }}>
              <Menu
                mode="inline"
                style={{ borderInlineEnd: "none" }}
                selectedKeys={spotId ? [spotId] : []}
                items={menuItems}
                onClick={({ key }) => openSpot(String(key))}
              />
            </div>
            <Divider style={{ margin: 0 }} />
            <Flex
              align="center"
              justify="space-between"
              style={{
                padding: `${token.paddingSM}px ${token.paddingLG}px`,
                fontSize: token.fontSizeSM,
              }}
            >
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                {stats.totalSpots} 处足迹
              </Text>
              <Link
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                style={{ color: token.colorTextTertiary }}
              >
                <GithubOutlined /> Source
              </Link>
            </Flex>
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

            <Drawer
              open={!!activeSpot}
              onClose={closeSpot}
              placement="right"
              width={DRAWER_WIDTH}
              getContainer={false}
              rootStyle={{ position: "absolute", inset: 0, pointerEvents: "none" }}
              styles={{
                wrapper: { pointerEvents: "auto", boxShadow: token.boxShadowSecondary },
                header: { borderBottom: `1px solid ${token.colorBorderSecondary}` },
                body: {
                  padding: `${token.paddingLG}px ${token.paddingLG}px`,
                  background: token.colorBgContainer,
                },
                footer: { borderTop: `1px solid ${token.colorBorderSecondary}` },
              }}
              title={
                activeSpot ? (
                  <Flex vertical gap={2}>
                    <Text strong style={{ fontSize: token.fontSizeHeading5 }}>
                      {activeSpot.name}
                    </Text>
                    {activeSpot.city && (
                      <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                        <EnvironmentOutlined /> {activeSpot.city}
                      </Text>
                    )}
                  </Flex>
                ) : null
              }
              footer={
                activeSpot ? (
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    block
                    onClick={() => void copyLink()}
                  >
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
    </Layout>
  );
}

/**
 * Header 右侧的旅行概览条：横向 Statistic 组。
 *
 * 遵循 v6 排版：数值用 title-lg（16px 600），标签用 body-sm 次级文本。
 * 分隔线用 Divider type="vertical" 保持 4px 网格节律。
 */
function JourneyOverviewStrip({
  stats,
  token,
}: {
  stats: ReturnType<typeof computeJourneyStats>;
  token: GlobalToken;
}) {
  const valueStyle: React.CSSProperties = {
    fontSize: token.fontSize,
    fontWeight: 600,
    color: token.colorText,
    lineHeight: 1.2,
  };
  const items: Array<{ label: string; value: string }> = [
    { label: "景点", value: String(stats.totalSpots) },
    { label: "城市", value: String(stats.totalCities) },
    { label: "天数", value: String(stats.totalDays) },
    { label: "花费", value: `¥${stats.totalCost.toLocaleString()}` },
  ];
  return (
    <Space split={<Divider type="vertical" style={{ marginInline: 0 }} />} size="middle">
      {items.map((it) => (
        <Flex vertical key={it.label} align="flex-end" gap={0}>
          <Text style={valueStyle}>{it.value}</Text>
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {it.label}
          </Text>
        </Flex>
      ))}
    </Space>
  );
}

/**
 * 详情抽屉主体：评分 → 标签 → 元信息 → 随笔 → 照片。
 *
 * 使用 Ant Design 官方组件（Rate/Tag/Descriptions/Card/Divider），
 * 视觉分层依靠 Divider 与 Title level 5，不额外引入色块或阴影。
 */
function SpotDetailPanel({ spot, token }: { spot: Spot; token: GlobalToken }) {
  const metaItems: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [];
  if (spot.weather) {
    metaItems.push({
      icon: <CalendarOutlined />,
      label: "天气",
      value: spot.weather,
    });
  }
  if (spot.companions) {
    metaItems.push({
      icon: <TeamOutlined />,
      label: "同行",
      value: spot.companions,
    });
  }
  if (typeof spot.cost === "number") {
    metaItems.push({
      icon: <WalletOutlined />,
      label: "花费",
      value: <Text style={{ fontWeight: 500 }}>¥{spot.cost.toLocaleString()}</Text>,
    });
  }

  return (
    <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
      {typeof spot.rating === "number" && (
        <Flex align="center" gap={token.marginXS}>
          <Rate disabled allowHalf value={spot.rating} style={{ fontSize: 16 }} />
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {spot.rating.toFixed(1)} / 5.0
          </Text>
        </Flex>
      )}

      {spot.tags && spot.tags.length > 0 && (
        <Flex gap={token.marginXXS} wrap>
          {spot.tags.map((tag) => (
            <Tag key={tag} color={tagColor(tag)} style={{ marginInlineEnd: 0 }}>
              {tag}
            </Tag>
          ))}
        </Flex>
      )}

      <Descriptions
        column={1}
        size="small"
        colon={false}
        labelStyle={{ color: token.colorTextTertiary, width: 56 }}
      >
        <Descriptions.Item label="时间">{formatSpotDateTime(spot)}</Descriptions.Item>
        {spot.address && <Descriptions.Item label="地址">{spot.address}</Descriptions.Item>}
      </Descriptions>

      {metaItems.length > 0 && (
        <Card size="small" variant="borderless" style={{ background: token.colorFillQuaternary }}>
          <Row gutter={[token.marginSM, token.marginXS]}>
            {metaItems.map((it) => (
              <Col span={metaItems.length === 3 ? 8 : 12} key={it.label}>
                <Flex vertical gap={2}>
                  <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    {it.icon} {it.label}
                  </Text>
                  <Text style={{ fontSize: token.fontSize }}>{it.value}</Text>
                </Flex>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {spot.essay && (
        <>
          <Divider titlePlacement="left" style={{ margin: `${token.marginXS}px 0` }}>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM, fontWeight: 400 }}>
              随笔
            </Text>
          </Divider>
          <Paragraph
            style={{
              margin: 0,
              color: token.colorText,
              lineHeight: token.lineHeightLG,
            }}
          >
            {spot.essay}
          </Paragraph>
        </>
      )}

      {spot.photos && spot.photos.length > 0 ? (
        <>
          <Divider titlePlacement="left" style={{ margin: `${token.marginXS}px 0` }}>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM, fontWeight: 400 }}>
              照片
            </Text>
          </Divider>
          <Image.PreviewGroup>
            <Row gutter={[token.marginXS, token.marginXS]}>
              {spot.photos.map((src) => (
                <Col span={12} key={src}>
                  <Image
                    src={src}
                    alt={spot.name}
                    style={{
                      borderRadius: token.borderRadiusLG,
                      aspectRatio: "4 / 3",
                      objectFit: "cover",
                    }}
                  />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </>
      ) : (
        !spot.essay && (
          <Empty
            description={
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                暂无照片与随笔
              </Text>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )
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
