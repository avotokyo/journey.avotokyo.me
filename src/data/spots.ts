/**
 * 景点数据层：从 `spots.json` 一次性派生排序、分组、统计与 Hash 路由。
 *
 * - `spots`：按日期+时间倒序（最新在前），供地图消费
 * - `dayGroups`：按日期倒序分组，日内按时间升序，供侧栏 Menu
 * - `journeyStats`：景点数、天数、城市数、总花费，供 Header 概览
 * - Hash 路由：选中景点通过 URL Hash（`#/spot/:id`）同步，便于分享深链接
 */
import rawSpots from "./spots.json";

/**
 * 景点数据结构，对应 `spots.json` 中的一条记录。
 *
 * 只有 `id`、`name`、`location`、`date` 为必填；其余字段用于详情抽屉的
 * 逐段展示（`Rate`、`Tag`、`Descriptions`、`Card` 元信息、随笔、照片）
 * 与 Header 的旅程概览统计。缺失字段在 UI 中会静默省略，保证增量录入。
 */
export interface Spot {
  /** 唯一标识，用于 Hash 路由与菜单 key */
  id: string;
  /** 景点名称，显示在侧栏菜单与详情抽屉标题 */
  name: string;
  /** 所属城市，用于分组统计、抽屉副标题与侧栏日期分组的城市摘要 */
  city?: string;
  /** 详细地址，显示在详情抽屉 Descriptions */
  address?: string;
  /** 经纬度坐标 [经度, 纬度]，供高德地图定位 */
  location: [number, number];
  /** 到访日期，格式 YYYY-MM-DD */
  date: string;
  /** 到访时间，格式 HH:mm，可选 */
  time?: string;
  /** 旅行随笔，纯文本，可选 */
  essay?: string;
  /** 照片 URL 列表，可选；抽屉内以 4:3 网格展示并支持大图预览 */
  photos?: string[];
  /** 当日天气描述，如 "晴 22℃"，展示在抽屉元信息卡片 */
  weather?: string;
  /** 同行者描述，如 "独自"、"与家人"、"与朋友" */
  companions?: string;
  /** 到访花费（人民币元），用于抽屉展示与总花费统计 */
  cost?: number;
  /** 主观评分，0-5 分（`Rate` 支持 0.5 递增） */
  rating?: number;
  /**
   * 标签集合，如 `["历史", "美食"]`。
   * `components/tagColors.ts` 中的 `TAG_COLOR_MAP` 将标签映射到 Ant Design 预设色，
   * 遵循 v6 规范：预设色只用于分类可视化，不作为主功能色。
   */
  tags?: string[];
}

/** 旅行整体概览统计，用于 Header 右侧的 4 项数值条 */
export interface JourneyStats {
  /** 到访景点总数 */
  totalSpots: number;
  /** 涉及的不同日期数（近似"旅行天数"） */
  totalDays: number;
  /** 涉及的不同城市数（缺失 city 字段的景点不计） */
  totalCities: number;
  /** 所有景点 cost 合计（人民币元），未录入视为 0 */
  totalCost: number;
}

/** 侧栏按日分组的一条行程，日内景点已按时间升序 */
export interface DayGroup {
  date: string;
  /** 当日涉及城市，以 ` · ` 拼接 */
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
  const journeyStats: JourneyStats = {
    totalSpots: spots.length,
    totalDays: dates.size,
    totalCities: cities.size,
    totalCost: spots.reduce((sum, s) => sum + (s.cost ?? 0), 0),
  };

  return { spots, spotById, dayGroups, journeyStats };
}

const journey = buildJourneyData(rawSpots as Spot[]);

/** 全量景点列表（日期+时间倒序） */
export const spots = journey.spots;

/** 侧栏 Menu 用的按日分组数据（日期倒序，日内时间升序） */
export const dayGroups = journey.dayGroups;

/** Header 旅程概览统计 */
export const journeyStats = journey.journeyStats;

/** 根据 id 查找景点，未找到时返回 undefined */
export function getSpotById(id: string): Spot | undefined {
  return journey.spotById.get(id);
}

/** 格式化景点的日期时间显示，无 time 时仅返回 date */
export function formatSpotDateTime(spot: Spot): string {
  return spot.time ? `${spot.date} ${spot.time}` : spot.date;
}

/** 从当前 URL Hash 解析景点 id，格式为 #/spot/:id */
function getSpotIdFromHash(): string | undefined {
  return location.hash.match(/^#\/spot\/([^/?#]+)/)?.[1];
}

/**
 * 订阅 Hash 变化，供 useSyncExternalStore 使用。
 * 浏览器前进/后退或直接修改 Hash 时，React 组件会自动重新渲染。
 */
export function subscribeSpotId(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export { getSpotIdFromHash };

/** 打开景点详情：写入 Hash 触发全局状态更新 */
export function openSpot(id: string): void {
  location.hash = `#/spot/${id}`;
}

/** 关闭景点详情：清空 Hash 回到概览视图 */
export function closeSpot(): void {
  location.hash = "#/";
}
