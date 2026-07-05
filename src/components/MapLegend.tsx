import { Badge, Card, Checkbox } from "antd";
import type { PlaceCategory } from "../data/schema.ts";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../data/schema.ts";

const CATEGORIES: PlaceCategory[] = ["visited", "stay", "residence", "airport", "wishlist"];

interface MapLegendProps {
  activeCategories: Set<PlaceCategory>;
  onChange: (categories: Set<PlaceCategory>) => void;
}

export default function MapLegend({ activeCategories, onChange }: MapLegendProps) {
  return (
    <Card size="small" className="map-legend-card">
      <Checkbox.Group
        value={[...activeCategories]}
        onChange={(values) => onChange(new Set(values as PlaceCategory[]))}
      >
        {CATEGORIES.map((cat) => (
          <Checkbox key={cat} value={cat}>
            <Badge color={CATEGORY_COLORS[cat]} text={CATEGORY_LABELS[cat]} />
          </Checkbox>
        ))}
      </Checkbox.Group>
    </Card>
  );
}
