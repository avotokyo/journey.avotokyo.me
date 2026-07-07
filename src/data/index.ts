/**
 * 旅程数据 Facade：类型、派生逻辑与 spots.json 唯一读取入口。
 *
 * buildJourneyData 为模块内私有实现；对外通过 journey 对象暴露
 * spots / dayGroups / stats / getById。
 */
import rawSpots from "./spots.json";

/** 景点数据结构，对应 spots.json 中的一条记录（id/name/location/date 必填，其余可选） */
export interface Spot {
  id: string;
  name: string;
  city?: string;
  address?: string;
  location: [number, number];
  date: string;
  time?: string;
  essay?: string;
  photos?: string[];
  weather?: string;
  companions?: string;
  cost?: number;
  rating?: number;
  tags?: string[];
}

/** 旅行整体概览统计，用于 Header 右侧的 4 项数值条 */
export interface JourneyStats {
  totalSpots: number;
  totalDays: number;
  totalCities: number;
  totalCost: number;
}

/** 侧栏按日分组的一条行程，日内景点已按时间升序 */
export interface DayGroup {
  date: string;
  cities: string;
  spots: Spot[];
}

function compareSpotDesc(a: Spot, b: Spot): number {
  const dateCmp = b.date.localeCompare(a.date);
  if (dateCmp !== 0) return dateCmp;
  return (b.time ?? "").localeCompare(a.time ?? "");
}

function compareSpotTimeAsc(a: Spot, b: Spot): number {
  return (a.time ?? "").localeCompare(b.time ?? "");
}

function buildJourneyData(raw: Spot[]) {
  const spots = [...raw].sort(compareSpotDesc);
  const spotById = new Map(spots.map((s) => [s.id, s]));

  const byDate = new Map<string, Spot[]>();
  for (const spot of spots) {
    const group = byDate.get(spot.date) ?? [];
    group.push(spot);
    byDate.set(spot.date, group);
  }
  for (const group of byDate.values()) {
    group.sort(compareSpotTimeAsc);
  }

  const dayGroups: DayGroup[] = [...byDate.keys()]
    .sort((a, b) => b.localeCompare(a))
    .map((date) => {
      const group = byDate.get(date)!;
      const cities = [...new Set(group.map((s) => s.city).filter(Boolean))].join(" · ");
      return { date, cities, spots: group };
    });

  const dates = new Set(spots.map((s) => s.date));
  const cities = new Set(spots.map((s) => s.city).filter((c): c is string => Boolean(c)));
  const stats: JourneyStats = {
    totalSpots: spots.length,
    totalDays: dates.size,
    totalCities: cities.size,
    totalCost: spots.reduce((sum, s) => sum + (s.cost ?? 0), 0),
  };

  return { spots, spotById, dayGroups, stats };
}

/** 格式化景点的日期时间显示，无 time 时仅返回 date */
export function formatSpotDateTime(spot: Spot): string {
  return spot.time ? `${spot.date} ${spot.time}` : spot.date;
}

/** 模块加载时一次性派生，构建期数据为静态 */
const { spots, spotById, dayGroups, stats } = buildJourneyData(rawSpots as Spot[]);

/** 旅程数据对外入口 */
export const journey = {
  spots,
  dayGroups,
  stats,
  getById: (id: string) => spotById.get(id),
} as const;
