import { List, Tag, Typography } from "antd";
import type { Journey } from "../data/schema.ts";
import { formatDistance, formatDuration, getWaypoint } from "../data/schema.ts";

const { Title, Text } = Typography;

const MODE_LABELS: Record<string, string> = {
  walking: "步行",
  driving: "驾车",
  transit: "公交",
};

const MODE_COLORS: Record<string, string> = {
  walking: "green",
  driving: "blue",
  transit: "orange",
};

interface RoutePanelProps {
  journey: Journey;
}

export default function RoutePanel({ journey }: RoutePanelProps) {
  if (journey.segments.length === 0) return null;

  return (
    <div>
      <Title level={5}>路线详情</Title>
      <List
        size="small"
        dataSource={journey.segments}
        renderItem={(seg) => {
          const from = getWaypoint(journey, seg.from);
          const to = getWaypoint(journey, seg.to);
          const stats =
            seg.distance != null && seg.duration != null
              ? `${formatDistance(seg.distance)} · ${formatDuration(seg.duration)}`
              : null;

          return (
            <List.Item>
              <div className="route-item-content">
                <Tag color={MODE_COLORS[seg.mode]}>{MODE_LABELS[seg.mode] ?? seg.mode}</Tag>
                <Text>
                  {from?.name ?? seg.from} → {to?.name ?? seg.to}
                </Text>
                {stats && (
                  <Text type="secondary" className="route-stats">
                    {stats}
                  </Text>
                )}
              </div>
            </List.Item>
          );
        }}
      />
    </div>
  );
}
