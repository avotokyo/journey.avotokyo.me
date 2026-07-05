import { Avatar, Flex, Layout, Menu, Space, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import type { SiteProfile, Spot } from "../data/schema.ts";
import { CATEGORY_LABELS, groupSpotsByDate } from "../data/schema.ts";

const { Text, Title, Link } = Typography;

interface SidebarProps {
  profile: SiteProfile;
  spots: Spot[];
}

export default function Sidebar({ profile, spots }: SidebarProps) {
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
          {CATEGORY_LABELS[spot.category]}
        </Text>
      ),
    })),
  }));

  return (
    <Layout.Sider width={300} className="app-sidebar" theme="light">
      <Flex vertical gap={16} className="sidebar-inner">
        <Space direction="vertical" size={4}>
          <Avatar size={48} src={profile.avatar}>
            {profile.name[0]}
          </Avatar>
          <Title level={4} style={{ margin: 0 }}>
            {profile.name}
          </Title>
          <Text type="secondary">{profile.subtitle}</Text>
          {profile.links && profile.links.length > 0 && (
            <Space size="middle" wrap>
              {profile.links.map((item) => (
                <Link key={item.url} href={item.url} target="_blank">
                  {item.label}
                </Link>
              ))}
            </Space>
          )}
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
