import { Space, Tag } from "antd";
import type { PlaceCategory } from "../data/schema.ts";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../data/schema.ts";

const CATEGORIES: PlaceCategory[] = ["visited", "stay", "residence", "airport", "wishlist"];

interface MapLegendProps {
  activeCategories: Set<PlaceCategory>;
  onToggle: (category: PlaceCategory) => void;
}

export default function MapLegend({ activeCategories, onToggle }: MapLegendProps) {
  return (
    <Space wrap className="map-legend" size={4}>
      {CATEGORIES.map((cat) => {
        const active = activeCategories.has(cat);
        return (
          <Tag.CheckableTag
            key={cat}
            checked={active}
            onChange={() => onToggle(cat)}
            className="legend-tag"
          >
            <span className="legend-dot" style={{ background: CATEGORY_COLORS[cat] }} />
            {CATEGORY_LABELS[cat]}
          </Tag.CheckableTag>
        );
      })}
    </Space>
  );
}
