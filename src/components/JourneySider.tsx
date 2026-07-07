import { CalendarOutlined, EnvironmentOutlined, GithubOutlined } from "@ant-design/icons";
import { Divider, Flex, Layout, Menu, Typography, theme } from "antd";
import { useMemo } from "react";

import { groupSpotsByDate, openSpot, spots } from "../data/spots";

const { Text, Link } = Typography;

export function JourneySider({ spotId, totalSpots }: { spotId?: string; totalSpots: number }) {
  const { token } = theme.useToken();

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
            {totalSpots} 处足迹
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
  );
}
