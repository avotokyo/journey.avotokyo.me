/**
 * 高德地图封装：加载 JS API、管理标记点与视图切换。
 * 默认显示中国全景，选中景点后放大至街道级。
 */
import { load } from "@amap/amap-jsapi-loader";

import type { Spot } from "./data/spots.ts";

let amapPromise: Promise<typeof AMap> | null = null;

function loadAMap(): Promise<typeof AMap> {
  if (!amapPromise) {
    const key = import.meta.env.VITE_AMAP_KEY;
    if (!key) {
      return Promise.reject(new Error("VITE_AMAP_KEY is not configured"));
    }
    amapPromise = load({ key, version: "2.0" });
  }
  return amapPromise;
}

const DOT_SIZE = 20;
const DOT_COLOR = "#f97316";
const FOCUS_ZOOM = 16;
const CHINA_CENTER: [number, number] = [105.0, 36.0];
const CHINA_ZOOM = 4;
/** 右侧预留详情抽屉宽度，避免标记被遮挡 */
const DRAWER_PADDING: [number, number, number, number] = [80, 400, 80, 80];

function createDotElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "map-dot";
  el.style.setProperty("--dot-color", DOT_COLOR);
  el.style.width = `${DOT_SIZE}px`;
  el.style.height = `${DOT_SIZE}px`;
  return el;
}

export class WorldMapController {
  private map: AMap.Map | null = null;
  private markers: AMap.Marker[] = [];
  private markerById = new Map<string, AMap.Marker>();
  private onSpotClick?: (spot: Spot) => void;

  async init(
    container: HTMLElement,
    spots: Spot[],
    onSpotClick?: (spot: Spot) => void,
  ): Promise<void> {
    const AMap = await loadAMap();
    this.onSpotClick = onSpotClick;

    this.map = new AMap.Map(container, {
      zoom: CHINA_ZOOM,
      center: CHINA_CENTER,
      viewMode: "2D",
      mapStyle: "amap://styles/whitesmoke",
      showLabel: true,
    });

    this.renderMarkers(spots);
    this.showOverview();
  }

  showOverview(): void {
    this.map?.setZoomAndCenter(CHINA_ZOOM, CHINA_CENTER);
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

  private renderMarkers(spots: Spot[]): void {
    if (!this.map) return;

    for (const marker of this.markers) {
      this.map.remove(marker);
    }
    this.markers = [];
    this.markerById.clear();

    for (const spot of spots) {
      const marker = new AMap.Marker({
        position: spot.location,
        content: createDotElement(),
        offset: new AMap.Pixel(-DOT_SIZE / 2, -DOT_SIZE / 2),
        title: spot.name,
      });

      marker.on("click", () => this.onSpotClick?.(spot));

      this.map.add(marker);
      this.markers.push(marker);
      this.markerById.set(spot.id, marker);
    }
  }

  destroy(): void {
    this.map?.destroy();
    this.map = null;
    this.markers = [];
    this.markerById.clear();
  }
}
