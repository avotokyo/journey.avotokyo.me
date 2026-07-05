import { getAllJourneys, getAllMapPoints, getSiteProfile } from "../data/index.ts";
import { WorldMapController } from "../lib/amap/world-map-controller.ts";
import { renderSidebar } from "../components/sidebar.ts";
import { renderLegend, renderMapControls } from "../components/map-legend.ts";

let worldMap: WorldMapController | null = null;

export async function renderHome(container: HTMLElement): Promise<void> {
  document.body.classList.remove("scrollable");

  if (worldMap) {
    worldMap.destroy();
    worldMap = null;
  }

  container.innerHTML = `
    <div class="map-app">
      <div id="sidebar-panel"></div>
      <div class="map-stage">
        <div id="world-map" class="world-map"></div>
        <div id="legend-panel" class="map-overlay map-overlay-legend"></div>
        <div id="controls-panel" class="map-overlay map-overlay-controls"></div>
      </div>
    </div>
  `;

  const profile = getSiteProfile();
  const journeys = getAllJourneys();
  const points = getAllMapPoints();

  renderSidebar(container.querySelector("#sidebar-panel")!, profile, journeys);

  worldMap = new WorldMapController();
  await worldMap.init(container.querySelector("#world-map")!, points);

  renderLegend(container.querySelector("#legend-panel")!, worldMap);
  renderMapControls(container.querySelector("#controls-panel")!, worldMap);
}

export function destroyHomeMap(): void {
  if (worldMap) {
    worldMap.destroy();
    worldMap = null;
  }
}
