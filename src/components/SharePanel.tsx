import { Button, Dropdown, Image, Modal, Space, message } from "antd";
import type { MenuProps } from "antd";
import {
  CopyOutlined,
  DownloadOutlined,
  PictureOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import type { Journey } from "../data/schema.ts";
import { staticMapUrl } from "../lib/amap/web-service.ts";

interface SharePanelProps {
  journey: Journey;
}

export default function SharePanel({ journey }: SharePanelProps) {
  const [staticMapOpen, setStaticMapOpen] = useState(false);
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

  const openStaticMap = () => {
    const center = journey.waypoints[0]?.location ?? [116.4074, 39.9042];
    const markers = journey.waypoints.map((wp) => ({ location: wp.location, label: wp.name[0] }));
    setStaticMapSrc(staticMapUrl(center, markers));
    setStaticMapOpen(true);
  };

  const menuItems: MenuProps["items"] = [
    { key: "copy", icon: <CopyOutlined />, label: "复制分享链接", onClick: () => void copyLink() },
    { key: "export", icon: <DownloadOutlined />, label: "导出 JSON", onClick: exportJson },
    { key: "map", icon: <PictureOutlined />, label: "生成静态地图", onClick: openStaticMap },
  ];

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
        <Button size="small" icon={<ShareAltOutlined />}>
          分享
        </Button>
      </Dropdown>

      <Modal
        title="静态地图预览"
        open={staticMapOpen}
        onCancel={() => setStaticMapOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setStaticMapOpen(false)}>关闭</Button>
            {staticMapSrc && (
              <Button
                type="primary"
                href={staticMapSrc}
                download="map.png"
                icon={<DownloadOutlined />}
              >
                下载地图
              </Button>
            )}
          </Space>
        }
      >
        {staticMapSrc && <Image src={staticMapSrc} alt="静态地图预览" />}
      </Modal>
    </>
  );
}
