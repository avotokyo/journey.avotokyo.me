export type TransportMode = "walking" | "driving" | "transit";

export type PlaceCategory = "visited" | "stay" | "residence" | "airport" | "wishlist";

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  visited: "到访",
  stay: "停留",
  residence: "居住",
  airport: "机场",
  wishlist: "心愿",
};

export const CATEGORY_COLORS: Record<PlaceCategory, string> = {
  visited: "#22c55e",
  stay: "#a855f7",
  residence: "#f97316",
  airport: "#38bdf8",
  wishlist: "#f472b6",
};

export interface Waypoint {
  id: string;
  name: string;
  address?: string;
  location: [number, number];
  date: string;
  time?: string;
  notes?: string;
  photos?: string[];
  category?: PlaceCategory;
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

export interface Place {
  id: string;
  name: string;
  location: [number, number];
  category: PlaceCategory;
  notes?: string;
}

export interface SiteProfile {
  name: string;
  subtitle: string;
  avatar?: string;
  links?: Array<{ label: string; url: string }>;
}

export interface MapPoint {
  id: string;
  name: string;
  location: [number, number];
  category: PlaceCategory;
  notes?: string;
  journeyId?: string;
  journeyTitle?: string;
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
