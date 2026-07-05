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

export interface Spot {
  id: string;
  name: string;
  address?: string;
  location: [number, number];
  category: PlaceCategory;
  date: string;
  time?: string;
  essay?: string;
  photos?: string[];
}

export interface SiteProfile {
  name: string;
  subtitle: string;
  avatar?: string;
  links?: Array<{ label: string; url: string }>;
}

export function formatSpotDateTime(spot: Spot): string {
  return spot.time ? `${spot.date} ${spot.time}` : spot.date;
}

export function groupSpotsByDate(spots: Spot[]): Map<string, Spot[]> {
  const groups = new Map<string, Spot[]>();
  for (const spot of spots) {
    const list = groups.get(spot.date) ?? [];
    list.push(spot);
    groups.set(spot.date, list);
  }
  for (const [, list] of groups) {
    list.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  }
  return groups;
}
