import { Button, Space } from "antd";
import { GlobalOutlined, EnvironmentOutlined, AppstoreOutlined } from "@ant-design/icons";

interface MapControlsProps {
  onReset: () => void;
  onToggleStyle: () => void;
  onFitAll: () => void;
}

export default function MapControls({ onReset, onToggleStyle, onFitAll }: MapControlsProps) {
  return (
    <Space className="map-controls">
      <Button
        type="default"
        shape="circle"
        icon={<GlobalOutlined />}
        onClick={onReset}
        title="重置视图"
      />
      <Button
        type="default"
        shape="circle"
        icon={<AppstoreOutlined />}
        onClick={onToggleStyle}
        title="切换地图样式"
      />
      <Button
        type="default"
        shape="circle"
        icon={<EnvironmentOutlined />}
        onClick={onFitAll}
        title="适应全部标记"
      />
    </Space>
  );
}
