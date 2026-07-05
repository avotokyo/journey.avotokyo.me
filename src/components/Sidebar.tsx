import { Flex, Layout, Menu, Space, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";

import type { Spot } from "../data/schema.ts";
import { groupSpotsByDate } from "../data/schema.ts";

const { Text, Title } = Typography;

interface SidebarProps {
  spots: Spot[];
}

/** 左侧时间线：按日期分组展示景点列表 */
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
