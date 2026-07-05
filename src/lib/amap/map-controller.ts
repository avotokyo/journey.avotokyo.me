import type { Journey, Waypoint } from "../../data/schema.ts";
import { getWaypoint } from "../../data/schema.ts";
import { loadAMap } from "./loader.ts";

const MODE_COLORS: Record<string, string> = {
  walking: "#27ae60",
  driving: "#3498db",
  transit: "#e67e22",
};

export class MapController {
  private map: AMap.Map | null = null;
  private markers: AMap.Marker[] = [];
  private polylines: AMap.Polyline[] = [];
  private infoWindow: AMap.InfoWindow | null = null;
  private markerById = new Map<string, AMap.Marker>();

  async init(container: HTMLElement, journey: Journey): Promise<void> {
    const AMap = await loadAMap();

    this.map = new AMap.Map(container, {
      zoom: 12,
      viewMode: "2D",
    });

    this.infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) });

    this.renderWaypoints(journey.waypoints);
    this.renderSegments(journey);
    this.fitBounds(journey.waypoints);
  }

  private renderWaypoints(waypoints: Waypoint[]): void {
    if (!this.map) return;

    for (const wp of waypoints) {
      const marker = new AMap.Marker({
        position: wp.location,
        title: wp.name,
        label: { content: wp.name, direction: "top" },
      });

      marker.on("click", () => this.openInfoWindow(wp));
      this.map.add(marker);
      this.markers.push(marker);
      this.markerById.set(wp.id, marker);
    }
  }

  private renderSegments(journey: Journey): void {
    if (!this.map) return;

    for (const seg of journey.segments) {
      const from = getWaypoint(journey, seg.from);
      const to = getWaypoint(journey, seg.to);
      if (!from || !to) continue;

      const path = seg.polyline?.length
        ? seg.polyline
        : ([from.location, to.location] as [number, number][]);

      const polyline = new AMap.Polyline({
        path,
        strokeColor: MODE_COLORS[seg.mode] ?? "#666",
        strokeWeight: 5,
        strokeOpacity: 0.8,
        lineJoin: "round",
      });

      this.map.add(polyline);
      this.polylines.push(polyline);
    }
  }

  private fitBounds(waypoints: Waypoint[]): void {
    if (!this.map || waypoints.length === 0) return;
    this.map.setFitView(this.markers, false, [60, 60, 60, 60]);
  }

  focusWaypoint(wp: Waypoint): void {
    if (!this.map) return;
    this.map.setCenter(wp.location);
    this.map.setZoom(15);
    this.openInfoWindow(wp);
  }

  private openInfoWindow(wp: Waypoint): void {
    if (!this.infoWindow || !this.map) return;

    const content = `
      <div class="map-info">
        <strong>${wp.name}</strong>
        ${wp.address ? `<p>${wp.address}</p>` : ""}
        ${wp.notes ? `<p class="map-info-notes">${wp.notes}</p>` : ""}
      </div>
    `;
    this.infoWindow.setContent(content);
    this.infoWindow.open(this.map, wp.location);
  }

  destroy(): void {
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
    this.markers = [];
    this.polylines = [];
    this.markerById.clear();
    this.infoWindow = null;
  }
}
