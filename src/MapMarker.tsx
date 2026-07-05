/**
 * 地图标记 React 组件。
 *
 * 使用 Ant Design Badge 状态点（design.md: Badge status dot），
 * 样式由 theme token 驱动，避免手写 DOM。
 */
import { Badge } from "antd";
import { useState } from "react";

import type { MarkerStyleConfig } from "./amap";

const DOT_SIZE = 16;

export function MapMarkerDot({ active, style }: { active: boolean; style: MarkerStyleConfig }) {
  const [hovered, setHovered] = useState(false);
  const scaled = active || hovered;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        lineHeight: 0,
        transform: scaled ? (active ? "scale(1.25)" : "scale(1.3)") : undefined,
        transition: `transform ${style.motionDurationFast}`,
      }}
    >
      <Badge
        dot
        color={active ? style.activeColor : style.color}
        styles={{
          indicator: {
            width: DOT_SIZE,
            height: DOT_SIZE,
            boxShadow: style.boxShadow,
            border: `2px solid ${style.borderColor}`,
          },
        }}
      />
    </div>
  );
}
