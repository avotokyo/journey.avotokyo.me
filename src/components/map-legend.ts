import type { PlaceCategory } from "../data/schema.ts";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../data/schema.ts";
import type { WorldMapController } from "../lib/amap/world-map-controller.ts";

const CATEGORIES: PlaceCategory[] = ["visited", "stay", "residence", "airport", "wishlist"];

export function renderLegend(container: HTMLElement, map: WorldMapController): void {
  const active = map.getActiveCategories();

  container.innerHTML = `
    <div class="map-legend">
      ${CATEGORIES.map((cat) => {
        const isActive = active.has(cat);
        return `
          <button
            type="button"
            class="legend-item${isActive ? "" : " legend-item-off"}"
            data-category="${cat}"
            aria-pressed="${isActive}"
          >
            <span class="legend-dot" style="background:${CATEGORY_COLORS[cat]}"></span>
            ${CATEGORY_LABELS[cat]}
          </button>
        `;
      }).join("")}
    </div>
  `;

  container.querySelectorAll(".legend-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = (btn as HTMLElement).dataset.category as PlaceCategory;
      map.toggleCategory(cat);
      renderLegend(container, map);
    });
  });
}

export function renderMapControls(container: HTMLElement, map: WorldMapController): void {
  container.innerHTML = `
    <div class="map-controls">
      <button type="button" class="map-control-btn" id="map-reset" title="重置视图">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/></svg>
      </button>
      <button type="button" class="map-control-btn" id="map-style" title="切换地图样式">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </button>
      <button type="button" class="map-control-btn" id="map-fit" title="适应全部标记">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      </button>
    </div>
  `;

  container.querySelector("#map-reset")!.addEventListener("click", () => map.resetView());
  container.querySelector("#map-style")!.addEventListener("click", () => map.toggleMapStyle());
  container.querySelector("#map-fit")!.addEventListener("click", () => map.fitAll());
}
