/**
 * 高德地图封装模块。
 *
 * 职责：
 * - 懒加载高德 JS API（单例 Promise，避免重复请求）
 * - 在地图上渲染景点标记（自定义圆点 DOM）
 * - 管理两种视图：中国全景概览 / 选中景点街道级聚焦
 *
 * 默认显示中国全景，选中景点后放大至街道级并预留右侧抽屉空间。
 */
import { load } from "@amap/amap-jsapi-loader";

import type { Spot } from "./data/spots";

/** 高德 API 加载 Promise 缓存，全局只加载一次 */
let amapPromise: Promise<typeof AMap> | null = null;

/**
 * 加载高德地图 JS API。
 * Key 从环境变量 VITE_AMAP_KEY 读取，未配置时直接 reject。
 */
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

/** 地图标记圆点的像素尺寸 */
const DOT_SIZE = 20;
/** 标记圆点颜色（橙色） */
const DOT_COLOR = "#f97316";
/** 聚焦景点时的目标缩放级别（街道级） */
const FOCUS_ZOOM = 16;
/** 中国全景视图的中心点 [经度, 纬度] */
const CHINA_CENTER: [number, number] = [105.0, 36.0];
/** 中国全景视图的缩放级别 */
const CHINA_ZOOM = 4;
/**
 * setFitView 的边距 [上, 右, 下, 左]（像素）。
 * 右侧预留 400px 给详情抽屉，避免标记点被遮挡。
 */
const DRAWER_PADDING: [number, number, number, number] = [80, 400, 80, 80];

/** 创建自定义 HTML 标记元素，样式由 .map-dot 控制 */
function createDotElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "map-dot";
  el.style.setProperty("--dot-color", DOT_COLOR);
  el.style.width = `${DOT_SIZE}px`;
  el.style.height = `${DOT_SIZE}px`;
  return el;
}

/**
 * 地图控制器：封装 AMap.Map 实例的生命周期与交互逻辑。
 *
 * 使用方式：
 * 1. init() 初始化地图并渲染标记
 * 2. focusSpot() / showOverview() 切换视图
 * 3. destroy() 组件卸载时释放资源
 */
export class WorldMapController {
  private map: AMap.Map | null = null;
  private markers: AMap.Marker[] = [];
  /** 景点 id → 标记实例，用于快速定位 */
  private markerById = new Map<string, AMap.Marker>();
  private onSpotClick?: (spot: Spot) => void;

  /**
   * 初始化地图实例并在其上渲染所有景点标记。
   * @param container 地图挂载的 DOM 容器
   * @param spots 景点列表
   * @param onSpotClick 点击标记时的回调
   */
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

  /** 回到中国全景概览视图 */
  showOverview(): void {
    this.map?.setZoomAndCenter(CHINA_ZOOM, CHINA_CENTER);
  }

  /**
   * 聚焦到指定景点。
   * 优先使用 setFitView 自适应标记位置，并预留抽屉边距；
   * 若标记不存在则直接跳转到坐标。
   */
  focusSpot(spot: Spot): void {
    if (!this.map) return;

    const marker = this.markerById.get(spot.id);
    if (marker) {
      this.map.setFitView([marker], false, DRAWER_PADDING, FOCUS_ZOOM);
    } else {
      this.map.setZoomAndCenter(FOCUS_ZOOM, spot.location);
    }
  }

  /** 清除旧标记并重新渲染，保持 markerById 索引同步 */
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
        // 偏移使圆点中心对准坐标点
        offset: new AMap.Pixel(-DOT_SIZE / 2, -DOT_SIZE / 2),
        title: spot.name,
      });

      marker.on("click", () => this.onSpotClick?.(spot));

      this.map.add(marker);
      this.markers.push(marker);
      this.markerById.set(spot.id, marker);
    }
  }

  /** 销毁地图实例并清空内部状态，防止内存泄漏 */
  destroy(): void {
    this.map?.destroy();
    this.map = null;
    this.markers = [];
    this.markerById.clear();
  }
}
