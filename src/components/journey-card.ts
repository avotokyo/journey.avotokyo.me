import type { Journey } from "../data/schema.ts";

export function renderJourneyCard(journey: Journey): string {
  const cover = journey.cover ?? "/favicon.svg";
  const waypointCount = journey.waypoints.length;

  return `
    <a class="journey-card" href="#/journey/${journey.id}">
      <div class="journey-card-cover">
        <img src="${cover}" alt="${journey.title}" loading="lazy" />
      </div>
      <div class="journey-card-body">
        <h2 class="journey-card-title">${journey.title}</h2>
        <p class="journey-card-dates">${journey.startDate} — ${journey.endDate}</p>
        ${journey.description ? `<p class="journey-card-desc">${journey.description}</p>` : ""}
        <span class="journey-card-meta">${waypointCount} 个地点</span>
      </div>
    </a>
  `;
}
