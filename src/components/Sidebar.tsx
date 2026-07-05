import { Avatar, Layout, List, Typography } from "antd";
import { Link, useParams } from "react-router-dom";
import type { Journey } from "../data/schema.ts";
import type { SiteProfile } from "../data/schema.ts";

const { Text, Title } = Typography;

interface SidebarProps {
  profile: SiteProfile;
  journeys: Journey[];
}

export default function Sidebar({ profile, journeys }: SidebarProps) {
  const { id: activeId } = useParams();

  return (
    <Layout.Sider width={300} className="app-sidebar" theme="light">
      <div className="sidebar-inner">
        <div className="sidebar-profile">
          <Avatar size={48} src={profile.avatar} className="sidebar-avatar">
            {profile.name[0]}
          </Avatar>
          <Title level={4} className="sidebar-name">
            {profile.name}
          </Title>
          <Text type="secondary" className="sidebar-subtitle">
            {profile.subtitle}
          </Text>
          {profile.links && profile.links.length > 0 && (
            <div className="sidebar-links">
              {profile.links.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <Text type="secondary" className="sidebar-nav-title">
          旅程
        </Text>
        <List
          size="small"
          dataSource={journeys}
          renderItem={(journey) => (
            <List.Item className="sidebar-journey-item">
              <Link
                to={`/journey/${journey.id}`}
                className={`sidebar-journey-link${activeId === journey.id ? " active" : ""}`}
              >
                <span className="sidebar-journey-title">{journey.title}</span>
                <Text type="secondary" className="sidebar-journey-meta">
                  {journey.startDate} · {journey.waypoints.length} 处
                </Text>
              </Link>
            </List.Item>
          )}
        />
      </div>
    </Layout.Sider>
  );
}
