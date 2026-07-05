import type { MapPoint, PlaceCategory } from "../../data/schema.ts";
import { CATEGORY_COLORS } from "../../data/schema.ts";
import { loadAMap } from "./loader.ts";

const MAP_STYLES = ["amap://styles/whitesmoke", "amap://styles/normal"] as const;

function createDotElement(category: PlaceCategory, highlighted = false): HTMLDivElement {
  const el = document.createElement("div");
  el.className = `map-dot map-dot-${category}${highlighted ? " map-dot-highlight" : ""}`;
  el.style.setProperty("--dot-color", CATEGORY_COLORS[category]);
  return el;
}

export class WorldMapController {
  private map: AMap.Map | null = null;
  private markers: AMap.Marker[] = [];
  private infoWindow: AMap.InfoWindow | null = null;
  private points: MapPoint[] = [];
  private activeCategories = new Set<PlaceCategory>([
    "visited",
    "stay",
    "residence",
    "airport",
    "wishlist",
  ]);
  private styleIndex = 0;
  private onPointClick?: (point: MapPoint) => void;

  async init(
    container: HTMLElement,
    points: MapPoint[],
    options?: {
      zoom?: number;
      center?: [number, number];
      onPointClick?: (point: MapPoint) => void;
    },
  ): Promise<void> {
    const AMap = await loadAMap();
    this.points = points;
    this.onPointClick = options?.onPointClick;

    this.map = new AMap.Map(container, {
      zoom: options?.zoom ?? 5,
      center: options?.center ?? [116.4074, 39.9042],
      viewMode: "2D",
      mapStyle: MAP_STYLES[0],
      showLabel: true,
    });

    this.infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -12) });
    this.renderMarkers();
    if (!options?.center) this.fitAll();
  }

  setCategoryFilter(categories: Set<PlaceCategory>): void {
    this.activeCategories = categories;
    this.renderMarkers();
  }

  toggleCategory(category: PlaceCategory): void {
    if (this.activeCategories.has(category)) {
      this.activeCategories.delete(category);
    } else {
      this.activeCategories.add(category);
    }
    this.renderMarkers();
  }

  getActiveCategories(): Set<PlaceCategory> {
    return new Set(this.activeCategories);
  }

  fitAll(): void {
    if (!this.map || this.markers.length === 0) return;
    this.map.setFitView(this.markers, false, [80, 80, 80, 340]);
  }

  focusPoint(point: MapPoint): void {
    if (!this.map) return;
    this.map.setZoomAndCenter(12, point.location);
    this.openInfo(point);
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

    for (const point of this.points) {
      if (!this.activeCategories.has(point.category)) continue;

      const highlighted = point.category === "residence";
      const marker = new AMap.Marker({
        position: point.location,
        content: createDotElement(point.category, highlighted),
        offset: new AMap.Pixel(-6, -6),
        title: point.name,
      });

      marker.on("click", () => {
        this.openInfo(point);
        this.onPointClick?.(point);
      });

      this.map!.add(marker);
      this.markers.push(marker);
    }
  }

  private openInfo(point: MapPoint): void {
    if (!this.infoWindow || !this.map) return;

    const journeyLink = point.journeyId
      ? `<a href="#/journey/${point.journeyId}" class="map-info-link">查看旅程 →</a>`
      : "";

    this.infoWindow.setContent(`
      <div class="map-info">
        <strong>${point.name}</strong>
        ${point.journeyTitle ? `<p class="map-info-journey">${point.journeyTitle}</p>` : ""}
        ${point.notes ? `<p class="map-info-notes">${point.notes}</p>` : ""}
        ${journeyLink}
      </div>
    `);
    this.infoWindow.open(this.map, point.location);
  }

  destroy(): void {
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
    this.markers = [];
    this.infoWindow = null;
  }
}
