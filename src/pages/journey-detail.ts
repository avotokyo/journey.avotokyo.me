import { getJourneyById } from "../data/index.ts";
import { createMapView, type MapViewHandle } from "../components/map-view.ts";
import { renderTimeline } from "../components/timeline.ts";
import { renderPhotoGallery } from "../components/photo-gallery.ts";
import { renderRoutePanel } from "../components/route-panel.ts";
import { renderSharePanel } from "../components/share-panel.ts";
import { renderLayout } from "../router.ts";

let mapHandle: MapViewHandle | null = null;

export async function renderJourneyDetail(container: HTMLElement, id: string): Promise<void> {
  if (mapHandle) {
    mapHandle.destroy();
    mapHandle = null;
  }

  const journey = getJourneyById(id);
  if (!journey) {
    container.innerHTML = renderLayout(`
      <section class="not-found">
        <h1>未找到旅行记录</h1>
        <p>找不到 ID 为 "${id}" 的旅程。</p>
        <a class="btn btn-primary" href="#/">返回首页</a>
      </section>
    `);
    return;
  }

  container.innerHTML = renderLayout(`
    <section class="journey-detail">
      <div class="journey-header">
        <div class="journey-header-info">
          <a class="back-link" href="#/">&larr; 全部旅程</a>
          <h1>${journey.title}</h1>
          <p class="journey-dates">${journey.startDate} — ${journey.endDate}</p>
          ${journey.description ? `<p class="journey-desc">${journey.description}</p>` : ""}
        </div>
        <div id="share-panel"></div>
      </div>
      <div class="journey-layout">
        <div class="journey-map" id="map-container"></div>
        <aside class="journey-sidebar">
          <div id="timeline-panel"></div>
          <div id="route-panel"></div>
          <div id="photo-panel"></div>
        </aside>
      </div>
    </section>
  `);

  renderSharePanel(container.querySelector("#share-panel")!, journey);
  renderRoutePanel(container.querySelector("#route-panel")!, journey);
  renderPhotoGallery(container.querySelector("#photo-panel")!, journey);

  mapHandle = await createMapView(container.querySelector("#map-container")!, journey);

  renderTimeline(container.querySelector("#timeline-panel")!, journey, (wp) => {
    mapHandle?.focusWaypoint(wp.id);
  });
}
