import type { DayGroup, JourneyStats, Spot } from "./spot";

function compareSpotDesc(a: Spot, b: Spot): number {
  const dateCmp = b.date.localeCompare(a.date);
  if (dateCmp !== 0) return dateCmp;
  return (b.time ?? "").localeCompare(a.time ?? "");
}

function compareSpotTimeAsc(a: Spot, b: Spot): number {
  return (a.time ?? "").localeCompare(b.time ?? "");
}

export interface JourneyData {
  spots: Spot[];
  spotById: Map<string, Spot>;
  dayGroups: DayGroup[];
  journeyStats: JourneyStats;
}

/** 从原始景点列表派生排序、分组与统计（纯函数，无副作用） */
export function buildJourneyData(raw: Spot[]): JourneyData {
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
  const journeyStats: JourneyStats = {
    totalSpots: spots.length,
    totalDays: dates.size,
    totalCities: cities.size,
    totalCost: spots.reduce((sum, s) => sum + (s.cost ?? 0), 0),
  };

  return { spots, spotById, dayGroups, journeyStats };
}

/** 格式化景点的日期时间显示，无 time 时仅返回 date */
export function formatSpotDateTime(spot: Spot): string {
  return spot.time ? `${spot.date} ${spot.time}` : spot.date;
}
