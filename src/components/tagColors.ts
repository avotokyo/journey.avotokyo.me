/**
 * 标签分类 → Ant Design 预设色映射。
 *
 * 遵循 v6 规范：预设色（blue/gold/purple/…）只用于分类可视化，
 * 不作为主功能色。同一类目在不同景点保持同一颜色，帮助用户建立记忆。
 */
const TAG_COLOR_MAP: Record<string, string> = {
  历史: "geekblue",
  地标: "blue",
  博物馆: "purple",
  美食: "gold",
  园林: "green",
  皇家: "gold",
  湖景: "cyan",
  自然: "green",
  山林: "green",
  水利: "cyan",
  古城: "volcano",
  胡同: "volcano",
  文艺: "magenta",
  骑行: "lime",
  步行街: "orange",
  夜景: "purple",
  城市: "blue",
  公园: "green",
  宗教: "gold",
};

export function tagColor(tag: string): string {
  return TAG_COLOR_MAP[tag] ?? "default";
}
