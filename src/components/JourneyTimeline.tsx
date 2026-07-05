import { Timeline, Typography } from "antd";
import type { Journey, Waypoint } from "../data/schema.ts";
import { groupWaypointsByDate } from "../data/schema.ts";

const { Title, Text } = Typography;

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
        <button type="button" className="timeline-entry" onClick={() => onSelect(wp)}>
          <Text strong>{wp.name}</Text>
          {wp.time && (
            <Text type="secondary" className="timeline-time">
              {" "}
              {wp.time}
            </Text>
          )}
          {wp.notes && (
            <div>
              <Text type="secondary" className="timeline-notes">
                {wp.notes}
              </Text>
            </div>
          )}
        </button>
      ),
    }));
  });

  return (
    <div>
      <Title level={5}>行程时间线</Title>
      <Timeline mode="left" items={items} className="journey-timeline" />
    </div>
  );
}
