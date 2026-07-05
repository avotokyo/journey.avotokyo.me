import { Link } from "react-router-dom";
import { Button, Layout, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function NotFoundPage() {
  return (
    <Layout className="map-app">
      <Layout.Content className="not-found">
        <Title level={2}>404</Title>
        <Paragraph type="secondary">页面不存在</Paragraph>
        <Link to="/">
          <Button type="primary">返回首页</Button>
        </Link>
      </Layout.Content>
    </Layout>
  );
}
