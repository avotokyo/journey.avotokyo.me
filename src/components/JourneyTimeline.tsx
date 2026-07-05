import { Space, Timeline, Typography } from "antd";
import type { Journey, Waypoint } from "../data/schema.ts";
import { groupWaypointsByDate } from "../data/schema.ts";

const { Title, Text, Link } = Typography;

interface JourneyTimelineProps {
  journey: Journey;
  onSelect: (waypoint: Waypoint) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default function JourneyTimeline({ journey, onSelect }: JourneyTimelineProps) {
  const groups = groupWaypointsByDate(journey.waypoints);
  const sortedDates = [...groups.keys()].sort();

  const items = sortedDates.flatMap((date) => {
    const waypoints = groups.get(date)!;
    return waypoints.map((wp) => ({
      key: wp.id,
      label: formatDate(date),
      children: (
        <Space direction="vertical" size={0}>
          <Link onClick={() => onSelect(wp)}>
            {wp.name}
            {wp.time ? ` · ${wp.time}` : ""}
          </Link>
          {wp.notes && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {wp.notes}
            </Text>
          )}
        </Space>
      ),
    }));
  });

  return (
    <>
      <Title level={5}>行程时间线</Title>
      <Timeline mode="left" items={items} />
    </>
  );
}
