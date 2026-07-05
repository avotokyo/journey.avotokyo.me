import { Avatar, Flex, Layout, Menu, Space, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import type { Journey, SiteProfile } from "../data/schema.ts";

const { Text, Title, Link } = Typography;

interface SidebarProps {
  profile: SiteProfile;
  journeys: Journey[];
}

export default function Sidebar({ profile, journeys }: SidebarProps) {
  const { id: activeId } = useParams();
  const navigate = useNavigate();

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
          items={[
            {
              type: "group",
              label: "旅程",
              children: journeys.map((journey) => ({
                key: journey.id,
                label: journey.title,
                extra: (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {journey.waypoints.length} 处
                  </Text>
                ),
              })),
            },
          ]}
          onClick={({ key }) => navigate(`/journey/${key}`)}
        />
      </Flex>
    </Layout.Sider>
  );
}
