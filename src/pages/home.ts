import { getAllJourneys } from "../data/index.ts";
import { renderJourneyCard } from "../components/journey-card.ts";
import { renderLayout } from "../router.ts";

export function renderHome(container: HTMLElement): void {
  const journeys = getAllJourneys();

  container.innerHTML = renderLayout(`
    <section class="home">
      <div class="home-hero">
        <h1>旅行记录</h1>
        <p class="home-subtitle">用地图记录每一段旅程</p>
      </div>
      ${
        journeys.length > 0
          ? `<div class="journey-grid">${journeys.map(renderJourneyCard).join("")}</div>`
          : `<p class="empty-state">暂无旅行记录</p>`
      }
    </section>
  `);
}
