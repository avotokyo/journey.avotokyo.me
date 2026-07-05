import { getJourneyById, getAllJourneys, getSiteProfile } from "../data/index.ts";
import { createMapView, type MapViewHandle } from "../components/map-view.ts";
import { renderTimeline } from "../components/timeline.ts";
import { renderPhotoGallery } from "../components/photo-gallery.ts";
import { renderRoutePanel } from "../components/route-panel.ts";
import { renderSharePanel } from "../components/share-panel.ts";
import { renderSidebar } from "../components/sidebar.ts";
import { destroyHomeMap } from "./home.ts";

let mapHandle: MapViewHandle | null = null;

export async function renderJourneyDetail(container: HTMLElement, id: string): Promise<void> {
  document.body.classList.remove("scrollable");
  destroyHomeMap();
  if (mapHandle) {
    mapHandle.destroy();
    mapHandle = null;
  }

  const journey = getJourneyById(id);
  if (!journey) {
    container.innerHTML = `
      <div class="map-app">
        <section class="not-found">
          <h1>未找到旅行记录</h1>
          <p>找不到 ID 为 "${id}" 的旅程。</p>
          <a class="btn btn-primary" href="#/">返回地图</a>
        </section>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="map-app">
      <div id="sidebar-panel"></div>
      <div class="map-stage">
        <div id="journey-map" class="world-map"></div>
        <aside class="detail-panel" id="detail-panel">
          <div class="detail-panel-header">
            <a class="back-link" href="#/">&larr; 地图</a>
            <h1>${journey.title}</h1>
            <p class="journey-dates">${journey.startDate} — ${journey.endDate}</p>
            ${journey.description ? `<p class="journey-desc">${journey.description}</p>` : ""}
            <div id="share-panel"></div>
          </div>
          <div class="detail-panel-body">
            <div id="timeline-panel"></div>
            <div id="route-panel"></div>
            <div id="photo-panel"></div>
          </div>
        </aside>
      </div>
    </div>
  `;

  renderSidebar(container.querySelector("#sidebar-panel")!, getSiteProfile(), getAllJourneys(), id);
  renderSharePanel(container.querySelector("#share-panel")!, journey);
  renderRoutePanel(container.querySelector("#route-panel")!, journey);
  renderPhotoGallery(container.querySelector("#photo-panel")!, journey);

  mapHandle = await createMapView(container.querySelector("#journey-map")!, journey);

  renderTimeline(container.querySelector("#timeline-panel")!, journey, (wp) => {
    mapHandle?.focusWaypoint(wp.id);
  });
}
