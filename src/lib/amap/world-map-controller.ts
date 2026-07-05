import type { Spot } from "../../data/schema.ts";
import { loadAMap } from "./loader.ts";

const MAP_STYLES = ["amap://styles/whitesmoke", "amap://styles/normal"] as const;
const DOT_COLOR = "#f97316";

function createDotElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "map-dot";
  el.style.setProperty("--dot-color", DOT_COLOR);
  return el;
}

export class WorldMapController {
  private map: AMap.Map | null = null;
  private markers: AMap.Marker[] = [];
  private infoWindow: AMap.InfoWindow | null = null;
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

    this.infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -12) });
    this.renderMarkers();
    if (!options?.center) this.fitAll();
  }

  fitAll(): void {
    if (!this.map || this.markers.length === 0) return;
    this.map.setFitView(this.markers, false, [80, 80, 80, 340]);
  }

  focusSpot(spot: Spot): void {
    if (!this.map) return;
    this.map.setZoomAndCenter(14, spot.location);
    this.openInfo(spot);
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

    for (const spot of this.spots) {
      const marker = new AMap.Marker({
        position: spot.location,
        content: createDotElement(),
        offset: new AMap.Pixel(-6, -6),
        title: spot.name,
      });

      marker.on("click", () => {
        this.openInfo(spot);
        this.onSpotClick?.(spot);
      });

      this.map!.add(marker);
      this.markers.push(marker);
    }
  }

  private openInfo(spot: Spot): void {
    if (!this.infoWindow || !this.map) return;

    this.infoWindow.setContent(`
      <div class="map-info">
        <strong>${spot.name}</strong>
        ${spot.essay ? `<p class="map-info-notes">${spot.essay.slice(0, 60)}${spot.essay.length > 60 ? "…" : ""}</p>` : ""}
        <a href="#/spot/${spot.id}" class="map-info-link">查看详情 →</a>
      </div>
    `);
    this.infoWindow.open(this.map, spot.location);
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
