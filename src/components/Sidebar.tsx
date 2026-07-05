import { Flex, Layout, Menu, Space, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";

import type { Spot } from "../data/schema.ts";
import { groupSpotsByDate } from "../data/schema.ts";

const { Text, Title, Link } = Typography;

interface SidebarProps {
  spots: Spot[];
}

export default function Sidebar({ spots }: SidebarProps) {
  const { id: activeId } = useParams();
  const navigate = useNavigate();
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

  return (
    <Layout.Sider width={300} className="app-sidebar" theme="light">
      <Flex vertical gap={16} className="sidebar-inner">
        <Space direction="vertical" size={4}>
          <Title level={4} style={{ margin: 0 }}>
            牛油果旅行记✈️
          </Title>
          <Text type="secondary">景点 · 时间 · 照片 · 随笔</Text>
          <Link href="https://github.com" target="_blank">
            GitHub
          </Link>
        </Space>

        <Menu
          mode="inline"
          selectedKeys={activeId ? [activeId] : []}
          items={menuItems}
          onClick={({ key }) => navigate(`/spot/${key}`)}
        />
      </Flex>
    </Layout.Sider>
  );
}
