export type TransportMode = "walking" | "driving" | "transit";

export interface Waypoint {
  id: string;
  name: string;
  address?: string;
  location: [number, number];
  date: string;
  time?: string;
  notes?: string;
  photos?: string[];
}

export interface Segment {
  from: string;
  to: string;
  mode: TransportMode;
  polyline?: [number, number][];
  distance?: number;
  duration?: number;
}

export interface Journey {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  startDate: string;
  endDate: string;
  waypoints: Waypoint[];
  segments: Segment[];
}

export function getWaypoint(journey: Journey, id: string): Waypoint | undefined {
  return journey.waypoints.find((wp) => wp.id === id);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} 秒`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours} 小时 ${remaining} 分钟` : `${hours} 小时`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} 米`;
  return `${(meters / 1000).toFixed(1)} 公里`;
}

export function groupWaypointsByDate(waypoints: Waypoint[]): Map<string, Waypoint[]> {
  const groups = new Map<string, Waypoint[]>();
  for (const wp of waypoints) {
    const list = groups.get(wp.date) ?? [];
    list.push(wp);
    groups.set(wp.date, list);
  }
  for (const [, list] of groups) {
    list.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  }
  return groups;
}
