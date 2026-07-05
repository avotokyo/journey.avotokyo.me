import rawSpots from "./spots.json";

/** 景点数据结构，对应 spots.json 中的每条记录 */
export interface Spot {
  id: string;
  name: string;
  address?: string;
  /** 经纬度 [经度, 纬度] */
  location: [number, number];
  date: string;
  time?: string;
  essay?: string;
  photos?: string[];
}

/** 按日期、时间倒序排列（最新的在前） */
export const spots = [...(rawSpots as Spot[])].sort((a, b) => {
  const dateCmp = b.date.localeCompare(a.date);
  if (dateCmp !== 0) return dateCmp;
  return (b.time ?? "").localeCompare(a.time ?? "");
});

export function getSpotById(id: string): Spot | undefined {
  return spots.find((s) => s.id === id);
}

export function formatSpotDateTime(spot: Spot): string {
  return spot.time ? `${spot.date} ${spot.time}` : spot.date;
}

/** 按日期分组，同一天内按 time 升序排列 */
export function groupSpotsByDate(list: Spot[]): Map<string, Spot[]> {
  const groups = new Map<string, Spot[]>();
  for (const spot of list) {
    const group = groups.get(spot.date) ?? [];
    group.push(spot);
    groups.set(spot.date, group);
  }
  for (const [, group] of groups) {
    group.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  }
  return groups;
}

function getSpotIdFromHash(): string | undefined {
  return location.hash.match(/^#\/spot\/([^/?#]+)/)?.[1];
}

/** 监听 hash 路由 #/spot/:id，无需 react-router */
export function subscribeSpotId(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export { getSpotIdFromHash };

export function openSpot(id: string): void {
  location.hash = `#/spot/${id}`;
}

export function closeSpot(): void {
  location.hash = "#/";
}
