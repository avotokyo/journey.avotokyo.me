import { Button, Image, Space, Typography, message } from "antd";
import { CopyOutlined, DownloadOutlined, PictureOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { Journey } from "../data/schema.ts";
import { staticMapUrl } from "../lib/amap/web-service.ts";

const { Link: TextLink } = Typography;

interface SharePanelProps {
  journey: Journey;
}

export default function SharePanel({ journey }: SharePanelProps) {
  const [staticMapSrc, setStaticMapSrc] = useState<string | null>(null);
  const shareUrl = `${window.location.origin}${window.location.pathname}#/journey/${journey.id}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    message.success("链接已复制");
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(journey, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${journey.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateStaticMap = () => {
    const center = journey.waypoints[0]?.location ?? [116.4074, 39.9042];
    const markers = journey.waypoints.map((wp) => ({ location: wp.location, label: wp.name[0] }));
    setStaticMapSrc(staticMapUrl(center, markers));
  };

  return (
    <div className="share-panel">
      <Space wrap size="small">
        <Button size="small" icon={<CopyOutlined />} onClick={() => void copyLink()}>
          复制链接
        </Button>
        <Button size="small" icon={<DownloadOutlined />} onClick={exportJson}>
          导出 JSON
        </Button>
        <Button size="small" icon={<PictureOutlined />} onClick={generateStaticMap}>
          静态地图
        </Button>
      </Space>
      {staticMapSrc && (
        <div className="static-map-preview">
          <Image src={staticMapSrc} alt="静态地图预览" />
          <TextLink href={staticMapSrc} download="map.png">
            下载地图
          </TextLink>
        </div>
      )}
    </div>
  );
}
