import AMapLoader from "@amap/amap-jsapi-loader";

import type { Spot } from "./data/schema.ts";

let amapPromise: Promise<typeof AMap> | null = null;

function loadAMap(): Promise<typeof AMap> {
  if (!amapPromise) {
    const key = import.meta.env.VITE_AMAP_KEY;
    if (!key) {
      return Promise.reject(new Error("VITE_AMAP_KEY is not configured"));
    }
    amapPromise = AMapLoader.load({
      key,
      version: "2.0",
    });
  }
  return amapPromise;
}

const MAP_STYLES = ["amap://styles/whitesmoke", "amap://styles/normal"] as const;
const DOT_COLOR = "#f97316";
const FOCUS_ZOOM = 16;
const DRAWER_PADDING: [number, number, number, number] = [80, 400, 80, 80];

function createDotElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "map-dot";
  el.style.setProperty("--dot-color", DOT_COLOR);
  return el;
}

export class WorldMapController {
  private map: AMap.Map | null = null;
  private markers: AMap.Marker[] = [];
  private markerById = new Map<string, AMap.Marker>();
  private spots: Spot[] = [];
  private styleIndex = 0;
  private onSpotClick?: (spot: Spot) => void;

  async init(
    container: HTMLElement,
    spots: Spot[],
    options?: {
      zoom?: number;
      center?: [number, number];
      onSpotClick?: (spot: Spot) => void;
    },
  ): Promise<void> {
    const AMap = await loadAMap();
    this.spots = spots;
    this.onSpotClick = options?.onSpotClick;

    this.map = new AMap.Map(container, {
      zoom: options?.zoom ?? 5,
      center: options?.center ?? [116.4074, 39.9042],
      viewMode: "2D",
      mapStyle: MAP_STYLES[0],
      showLabel: true,
    });

    this.renderMarkers();
    if (!options?.center) this.fitAll();
  }

  fitAll(): void {
    if (!this.map || this.markers.length === 0) return;
    this.map.setFitView(this.markers, false, [80, 80, 80, 340]);
  }

  focusSpot(spot: Spot): void {
    if (!this.map) return;

    const marker = this.markerById.get(spot.id);
    if (marker) {
      this.map.setFitView([marker], false, DRAWER_PADDING, FOCUS_ZOOM);
    } else {
      this.map.setZoomAndCenter(FOCUS_ZOOM, spot.location);
    }
  }

  toggleMapStyle(): void {
    if (!this.map) return;
    this.styleIndex = (this.styleIndex + 1) % MAP_STYLES.length;
    this.map.setMapStyle(MAP_STYLES[this.styleIndex]);
  }

  resetView(): void {
    this.fitAll();
  }

  private renderMarkers(): void {
    if (!this.map) return;

    for (const marker of this.markers) {
      this.map.remove(marker);
    }
    this.markers = [];
    this.markerById.clear();

    for (const spot of this.spots) {
      const marker = new AMap.Marker({
        position: spot.location,
        content: createDotElement(),
        offset: new AMap.Pixel(-6, -6),
        title: spot.name,
      });

      marker.on("click", () => {
        this.onSpotClick?.(spot);
      });

      this.map!.add(marker);
      this.markers.push(marker);
      this.markerById.set(spot.id, marker);
    }
  }

  destroy(): void {
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
    this.markers = [];
    this.markerById.clear();
  }
}
