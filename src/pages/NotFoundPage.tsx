import { useNavigate } from "react-router-dom";
import { Button, Layout, Result } from "antd";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Layout className="map-app">
      <Layout.Content>
        <Result
          status="404"
          title="404"
          subTitle="页面不存在"
          extra={
            <Button type="primary" onClick={() => navigate("/")}>
              返回首页
            </Button>
          }
        />
      </Layout.Content>
    </Layout>
  );
}
