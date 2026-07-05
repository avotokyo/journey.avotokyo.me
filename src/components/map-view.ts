import type { Journey } from "../data/schema.ts";
import { MapController } from "../lib/amap/map-controller.ts";

export interface MapViewHandle {
  focusWaypoint: (id: string) => void;
  destroy: () => void;
}

export async function createMapView(
  container: HTMLElement,
  journey: Journey,
): Promise<MapViewHandle> {
  const controller = new MapController();
  await controller.init(container, journey);

  return {
    focusWaypoint(id: string) {
      const wp = journey.waypoints.find((w) => w.id === id);
      if (wp) controller.focusWaypoint(wp);
    },
    destroy() {
      controller.destroy();
    },
  };
}
