/**
 * 详情抽屉 Presenter：无遮罩悬浮于地图之上，宽度由 SPOT_DRAWER_WIDTH 控制。
 */
import { EnvironmentOutlined, LinkOutlined } from "@ant-design/icons";
import { Button, Drawer, Flex, Typography, theme } from "antd";

import { SPOT_DRAWER_WIDTH } from "../constants";
import type { Spot } from "../data";
import { SpotDetailPanel } from "./SpotDetailPanel";

const { Text } = Typography;

export function SpotDrawer({
  spot,
  onClose,
  onCopyLink,
}: {
  spot?: Spot;
  onClose: () => void;
  onCopyLink: () => void;
}) {
  const { token } = theme.useToken();

  return (
    <Drawer
      open={!!spot}
      onClose={onClose}
      placement="right"
      width={SPOT_DRAWER_WIDTH}
      getContainer={false}
      rootStyle={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      styles={{
        wrapper: { pointerEvents: "auto", boxShadow: token.boxShadowSecondary },
        header: { borderBottom: `1px solid ${token.colorBorderSecondary}` },
        body: {
          padding: `${token.paddingLG}px ${token.paddingLG}px`,
          background: token.colorBgContainer,
        },
        footer: { borderTop: `1px solid ${token.colorBorderSecondary}` },
      }}
      title={
        spot ? (
          <Flex vertical gap={2}>
            <Text strong style={{ fontSize: token.fontSizeHeading5 }}>
              {spot.name}
            </Text>
            {spot.city && (
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                <EnvironmentOutlined /> {spot.city}
              </Text>
            )}
          </Flex>
        ) : null
      }
      footer={
        spot ? (
          <Button type="primary" icon={<LinkOutlined />} block onClick={onCopyLink}>
            复制链接
          </Button>
        ) : null
      }
    >
      {spot && <SpotDetailPanel spot={spot} />}
    </Drawer>
  );
}
