/**
 * 景点数据层：类型定义、排序、分组、汇总统计与 Hash 路由。
 *
 * - `spots`：全局景点列表，按日期+时间倒序（最新在前），供侧栏/地图消费。
 * - `groupSpotsByDate`：按日期聚合，日内按时间升序，形成一日行程时间线。
 * - `computeJourneyStats`：汇总景点数、天数、城市数、总花费，供 Header 概览。
 * - Hash 路由：选中景点通过 URL Hash（`#/spot/:id`）同步，便于分享深链接。
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
  /** 旅行随笔，Markdown 纯文本，可选 */
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
   * App 侧维护 `TAG_COLOR_MAP` 将标签映射到 Ant Design 预设色，
   * 遵循 v6 规范：预设色只用于分类可视化，不作为主功能色。
   */
  tags?: string[];
}

/**
 * 全量景点列表，按日期、时间倒序排列（最新的在前）。
 * 从 JSON 导入后做一次排序，保证侧栏与地图数据顺序一致。
 */
export const spots = [...(rawSpots as Spot[])].sort((a, b) => {
  const dateCmp = b.date.localeCompare(a.date);
  if (dateCmp !== 0) return dateCmp;
  return (b.time ?? "").localeCompare(a.time ?? "");
});

/** 根据 id 查找景点，未找到时返回 undefined */
export function getSpotById(id: string): Spot | undefined {
  return spots.find((s) => s.id === id);
}

/** 格式化景点的日期时间显示，无 time 时仅返回 date */
export function formatSpotDateTime(spot: Spot): string {
  return spot.time ? `${spot.date} ${spot.time}` : spot.date;
}

/**
 * 按日期分组景点。
 * 同一天内按 time 升序排列（上午在前），便于按时间线浏览当日行程。
 */
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

/** 旅行整体概览统计，用于 Header 右侧的 4 项数值条 */
export interface JourneyStats {
  /** 到访景点总数 */
  totalSpots: number;
  /** 涉及的不同日期数（近似"旅行天数"） */
  totalDays: number;
  /** 涉及的不同城市数（缺失 city 字段的景点不计） */
  totalCities: number;
  /** 已录入 cost 字段的景点花费合计（人民币元） */
  totalCost: number;
}

/**
 * 汇总景点数据得到旅行概览。
 *
 * `totalCities` 只统计有 `city` 字段的景点，`totalCost` 只累加显式录入
 * 的 `cost`，避免因数据缺失导致虚低或引入 NaN。返回值可直接给
 * Header 的 `JourneyOverviewStrip` 消费。
 */
export function computeJourneyStats(list: Spot[]): JourneyStats {
  const dates = new Set(list.map((s) => s.date));
  const cities = new Set(list.map((s) => s.city).filter((c): c is string => Boolean(c)));
  const totalCost = list.reduce((sum, s) => sum + (s.cost ?? 0), 0);
  return {
    totalSpots: list.length,
    totalDays: dates.size,
    totalCities: cities.size,
    totalCost,
  };
}
