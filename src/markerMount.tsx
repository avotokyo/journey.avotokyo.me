/**
 * 将 React 地图标记挂载到高德 Marker content 容器。
 */
import { createRoot, type Root } from "react-dom/client";

import type { MarkerStyleConfig } from "./amap";
import { MapMarkerDot } from "./MapMarker";

export class MarkerMountManager {
  private roots = new Map<string, Root>();
  private style: MarkerStyleConfig;

  constructor(style: MarkerStyleConfig) {
    this.style = style;
  }

  createContainer(spotId: string, active: boolean): HTMLElement {
    const container = document.createElement("div");
    const root = createRoot(container);
    this.roots.set(spotId, root);
    root.render(<MapMarkerDot active={active} style={this.style} />);
    return container;
  }

  setActiveSpot(activeSpotId: string | null): void {
    for (const [id, root] of this.roots) {
      root.render(<MapMarkerDot active={id === activeSpotId} style={this.style} />);
    }
  }

  destroy(): void {
    for (const root of this.roots.values()) {
      root.unmount();
    }
    this.roots.clear();
  }
}
