/**
 * 顶栏 Presenter：品牌标题 + 旅程概览统计条。
 *
 * 点击标题触发 onGoHome（由 Container 组合导航与地图复位）。
 */
import { CompassOutlined } from "@ant-design/icons";
import { Flex, Layout, Typography, theme } from "antd";

import type { JourneyStats } from "../data";
import { JourneyOverviewStrip } from "./JourneyOverviewStrip";

const { Text, Link } = Typography;

export function AppHeader({ stats, onGoHome }: { stats: JourneyStats; onGoHome: () => void }) {
  const { token } = theme.useToken();

  return (
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
          onClick={onGoHome}
          style={{ color: token.colorText, fontSize: token.fontSizeHeading5, fontWeight: 600 }}
        >
          牛油果旅行记
        </Link>
        <Text type="secondary" style={{ marginLeft: token.marginXS }}>
          ᕕ( ᐛ )ᕗ · 个人旅行地图
        </Text>
      </Flex>
      <JourneyOverviewStrip stats={stats} />
    </Layout.Header>
  );
}
