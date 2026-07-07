/**
 * 高德地图封装模块。
 *
 * 使用 AMap.CircleMarker 原生圆点标记景点，配色由 Ant Design token 注入。
 * 视图模式：中国全景概览 / 选中景点街道级聚焦（setFitView 预留抽屉边距）。
 */
import { load } from "@amap/amap-jsapi-loader";

import type { Spot } from "./domain";

/** 详情抽屉宽度，地图 setFitView 右侧边距与之对齐 */
export const DRAWER_WIDTH = 380;

const MAP_DRAWER_PADDING: [number, number, number, number] = [80, DRAWER_WIDTH, 80, 80];

/** 高德 API 加载 Promise 缓存，全局只加载一次 */
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

const DOT_RADIUS = 8;
const ACTIVE_DOT_RADIUS = 10;
const Z_INDEX_DEFAULT = 100;
const Z_INDEX_ACTIVE = 101;

const FOCUS_ZOOM = 16;
const CHINA_CENTER: [number, number] = [105.0, 36.0];
const CHINA_ZOOM = 4;

/** 地图标记配色，由 React 侧 Ant Design token 注入 */
export type MarkerStyleConfig = {
  fillColor: string;
  activeFillColor: string;
  strokeColor: string;
};

function createCircleMarker(
  spot: Spot,
  style: MarkerStyleConfig,
  active: boolean,
): AMap.CircleMarker {
  return new AMap.CircleMarker({
    center: spot.location,
    radius: active ? ACTIVE_DOT_RADIUS : DOT_RADIUS,
    strokeColor: style.strokeColor,
    strokeWeight: 2,
    strokeOpacity: 1,
    fillColor: active ? style.activeFillColor : style.fillColor,
    fillOpacity: 1,
    cursor: "pointer",
    zIndex: active ? Z_INDEX_ACTIVE : Z_INDEX_DEFAULT,
  });
}

function applyMarkerState(
  marker: AMap.CircleMarker,
  style: MarkerStyleConfig,
  active: boolean,
): void {
  marker.setOptions({
    radius: active ? ACTIVE_DOT_RADIUS : DOT_RADIUS,
    fillColor: active ? style.activeFillColor : style.fillColor,
    zIndex: active ? Z_INDEX_ACTIVE : Z_INDEX_DEFAULT,
  });
}

/**
 * 地图控制器：封装 AMap.Map 实例的生命周期与交互逻辑。
 */
export class WorldMapController {
  private map: AMap.Map | null = null;
  /** 景点 id → CircleMarker，用于定位与高亮 */
  private markerById = new Map<string, AMap.CircleMarker>();
  private markerStyle: MarkerStyleConfig | null = null;
  private activeSpotId: string | null = null;
  private onSpotClick?: (spot: Spot) => void;

  async init(
    container: HTMLElement,
    spots: Spot[],
    markerStyle: MarkerStyleConfig,
    onSpotClick?: (spot: Spot) => void,
  ): Promise<void> {
    const AMap = await loadAMap();
    this.onSpotClick = onSpotClick;
    this.markerStyle = markerStyle;

    this.map = new AMap.Map(container, {
      zoom: CHINA_ZOOM,
      center: CHINA_CENTER,
      viewMode: "2D",
      mapStyle: "amap://styles/whitesmoke",
      showLabel: true,
    });

    this.addMarkers(spots);
    this.showOverview();
  }

  showOverview(): void {
    this.map?.setZoomAndCenter(CHINA_ZOOM, CHINA_CENTER);
  }

  focusSpot(spot: Spot): void {
    if (!this.map) return;

    const marker = this.markerById.get(spot.id);
    if (marker) {
      this.map.setFitView([marker], false, MAP_DRAWER_PADDING, FOCUS_ZOOM);
    } else {
      this.map.setZoomAndCenter(FOCUS_ZOOM, spot.location);
    }
  }

  setActiveSpot(spotId: string | null): void {
    if (!this.markerStyle) return;

    if (this.activeSpotId) {
      const prev = this.markerById.get(this.activeSpotId);
      if (prev) applyMarkerState(prev, this.markerStyle, false);
    }

    this.activeSpotId = spotId;

    if (spotId) {
      const next = this.markerById.get(spotId);
      if (next) applyMarkerState(next, this.markerStyle, true);
    }
  }

  /** 更新全部标记配色，无需重建地图实例 */
  updateMarkerStyle(style: MarkerStyleConfig): void {
    this.markerStyle = style;
    for (const [id, marker] of this.markerById) {
      applyMarkerState(marker, style, id === this.activeSpotId);
    }
  }

  private addMarkers(spots: Spot[]): void {
    if (!this.map || !this.markerStyle) return;

    for (const spot of spots) {
      const marker = createCircleMarker(spot, this.markerStyle, spot.id === this.activeSpotId);

      marker.on("click", () => this.onSpotClick?.(spot));

      this.map.add(marker);
      this.markerById.set(spot.id, marker);
    }
  }

  destroy(): void {
    this.map?.destroy();
    this.map = null;
    this.markerById.clear();
    this.markerStyle = null;
    this.activeSpotId = null;
  }
}
