import rawSpots from "./data/spots.json";
/**
 * 旅程数据 Repository + Facade。
 *
 * 唯一读取 `spots.json` 的模块，对外暴露排序、分组、统计与按 id 查询。
 */
import { buildJourneyData, type Spot } from "./domain";

const journey = buildJourneyData(rawSpots as Spot[]);

export const journeyRepository = {
  spots: journey.spots,
  dayGroups: journey.dayGroups,
  stats: journey.journeyStats,
  getById: (id: string) => journey.spotById.get(id),
} as const;
