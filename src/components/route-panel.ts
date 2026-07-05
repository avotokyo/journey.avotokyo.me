import type { Journey } from "../data/schema.ts";
import { formatDistance, formatDuration, getWaypoint } from "../data/schema.ts";

const MODE_LABELS: Record<string, string> = {
  walking: "步行",
  driving: "驾车",
  transit: "公交",
};

export function renderRoutePanel(container: HTMLElement, journey: Journey): void {
  if (journey.segments.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <h3 class="panel-title">路线详情</h3>
    <ul class="route-list">
      ${journey.segments
        .map((seg) => {
          const from = getWaypoint(journey, seg.from);
          const to = getWaypoint(journey, seg.to);
          const modeLabel = MODE_LABELS[seg.mode] ?? seg.mode;
          const stats =
            seg.distance != null && seg.duration != null
              ? `<span class="route-stats">${formatDistance(seg.distance)} · ${formatDuration(seg.duration)}</span>`
              : "";

          return `
            <li class="route-item route-${seg.mode}">
              <span class="route-mode">${modeLabel}</span>
              <span class="route-path">${from?.name ?? seg.from} → ${to?.name ?? seg.to}</span>
              ${stats}
            </li>
          `;
        })
        .join("")}
    </ul>
  `;
}
