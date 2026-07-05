import { FloatButton } from "antd";
import { GlobalOutlined, EnvironmentOutlined, AppstoreOutlined } from "@ant-design/icons";

interface MapControlsProps {
  onReset: () => void;
  onToggleStyle: () => void;
  onFitAll: () => void;
}

export default function MapControls({ onReset, onToggleStyle, onFitAll }: MapControlsProps) {
  return (
    <FloatButton.Group shape="circle" className="map-float-buttons">
      <FloatButton icon={<GlobalOutlined />} tooltip="重置视图" onClick={onReset} />
      <FloatButton icon={<AppstoreOutlined />} tooltip="切换地图样式" onClick={onToggleStyle} />
      <FloatButton icon={<EnvironmentOutlined />} tooltip="适应全部标记" onClick={onFitAll} />
    </FloatButton.Group>
  );
}
