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

/** 格式化显示时间，有 time 则拼接日期与时间 */
export function formatSpotDateTime(spot: Spot): string {
  return spot.time ? `${spot.date} ${spot.time}` : spot.date;
}

/** 按日期分组，同一天内按 time 升序排列 */
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

/** 按日期、时间倒序排列（最新的在前） */
export function getAllSpots(spots: Spot[]): Spot[] {
  return [...spots].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return (b.time ?? "").localeCompare(a.time ?? "");
  });
}

export function getSpotById(spots: Spot[], id: string): Spot | undefined {
  return spots.find((s) => s.id === id);
}
