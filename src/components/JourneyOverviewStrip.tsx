/**
 * Header 右侧的旅行概览条：横向数值组。
 *
 * 遵循 v6 排版：数值用 title-lg（16px 600），标签用 body-sm 次级文本。
 * 分隔线用 Divider type="vertical" 保持 4px 网格节律。
 */
import { Divider, Flex, Space, Typography, theme } from "antd";

import type { JourneyStats } from "../domain";

const { Text } = Typography;

export function JourneyOverviewStrip({ stats }: { stats: JourneyStats }) {
  const { token } = theme.useToken();
  const valueStyle: React.CSSProperties = {
    fontSize: token.fontSize,
    fontWeight: 600,
    color: token.colorText,
    lineHeight: 1.2,
  };
  const items: Array<{ label: string; value: string }> = [
    { label: "景点", value: String(stats.totalSpots) },
    { label: "城市", value: String(stats.totalCities) },
    { label: "天数", value: String(stats.totalDays) },
    { label: "花费", value: `¥${stats.totalCost.toLocaleString()}` },
  ];
  return (
    <Space split={<Divider type="vertical" style={{ marginInline: 0 }} />} size="middle">
      {items.map((it) => (
        <Flex vertical key={it.label} align="flex-end" gap={0}>
          <Text style={valueStyle}>{it.value}</Text>
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {it.label}
          </Text>
        </Flex>
      ))}
    </Space>
  );
}
