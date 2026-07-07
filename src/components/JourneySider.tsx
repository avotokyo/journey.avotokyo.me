import { CalendarOutlined, EnvironmentOutlined, GithubOutlined } from "@ant-design/icons";
import { Divider, Flex, Layout, Menu, Typography, theme } from "antd";
import { useMemo } from "react";

import type { DayGroup, JourneyStats } from "../data";

const { Text, Link } = Typography;

export function JourneySider({
  spotId,
  dayGroups,
  stats,
  onSelectSpot,
}: {
  spotId?: string;
  dayGroups: DayGroup[];
  stats: JourneyStats;
  onSelectSpot: (id: string) => void;
}) {
  const { token } = theme.useToken();

  const menuItems = useMemo(
    () =>
      dayGroups.map(({ date, cities, spots: group }) => ({
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
      })),
    [dayGroups, token.colorTextTertiary, token.fontSizeSM],
  );

  return (
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
            onClick={({ key }) => onSelectSpot(String(key))}
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
            href="https://github.com/avotokyo/journey.avotokyo.me/"
            target="_blank"
            rel="noreferrer"
            style={{ color: token.colorTextTertiary }}
          >
            <GithubOutlined /> Source
          </Link>
        </Flex>
      </Flex>
    </Layout.Sider>
  );
}
