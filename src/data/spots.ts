/**
 * 景点数据层：类型定义、排序、分组与 Hash 路由状态管理。
 *
 * 数据来源为 spots.json，运行时按日期/时间排序。
 * 选中状态通过 URL Hash（#/spot/:id）同步，便于分享深链接且无需引入路由库。
 */
import rawSpots from "./spots.json";

/** 景点数据结构，对应 spots.json 中的每条记录 */
export interface Spot {
  /** 唯一标识，用于 Hash 路由与菜单 key */
  id: string;
  /** 景点名称，显示在侧栏菜单与详情抽屉标题 */
  name: string;
  /** 详细地址，可选，显示在详情抽屉 */
  address?: string;
  /** 经纬度坐标 [经度, 纬度]，供高德地图定位 */
  location: [number, number];
  /** 到访日期，格式 YYYY-MM-DD */
  date: string;
  /** 到访时间，格式 HH:mm，可选 */
  time?: string;
  /** 旅行随笔，可选 */
  essay?: string;
  /** 照片 URL 列表，可选 */
  photos?: string[];
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
