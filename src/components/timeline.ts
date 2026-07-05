import type { Journey, Waypoint } from "../data/schema.ts";
import { groupWaypointsByDate } from "../data/schema.ts";

export function renderTimeline(
  container: HTMLElement,
  journey: Journey,
  onSelect: (waypoint: Waypoint) => void,
): void {
  const groups = groupWaypointsByDate(journey.waypoints);
  const sortedDates = [...groups.keys()].sort();

  container.innerHTML = `
    <h3 class="panel-title">行程时间线</h3>
    <div class="timeline">
      ${sortedDates
        .map((date) => {
          const waypoints = groups.get(date)!;
          return `
            <div class="timeline-day">
              <div class="timeline-date">${formatDate(date)}</div>
              ${waypoints
                .map(
                  (wp) => `
                <button class="timeline-item" data-id="${wp.id}" type="button">
                  <span class="timeline-time">${wp.time ?? ""}</span>
                  <span class="timeline-name">${wp.name}</span>
                  ${wp.notes ? `<span class="timeline-notes">${wp.notes}</span>` : ""}
                </button>
              `,
                )
                .join("")}
            </div>
          `;
        })
        .join("")}
    </div>
  `;

  container.querySelectorAll(".timeline-item").forEach((el) => {
    el.addEventListener("click", () => {
      const id = (el as HTMLElement).dataset.id!;
      const wp = journey.waypoints.find((w) => w.id === id);
      if (wp) onSelect(wp);
    });
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}
