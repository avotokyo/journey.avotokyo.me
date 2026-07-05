import type { Journey } from "../data/schema.ts";
import type { SiteProfile } from "../data/schema.ts";

export function renderSidebar(
  container: HTMLElement,
  profile: SiteProfile,
  journeys: Journey[],
  activeJourneyId?: string,
): void {
  const links = (profile.links ?? [])
    .map(
      (l) =>
        `<a class="sidebar-link" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`,
    )
    .join("");

  container.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-profile">
        ${
          profile.avatar
            ? `<img class="sidebar-avatar" src="${profile.avatar}" alt="${profile.name}" />`
            : `<div class="sidebar-avatar sidebar-avatar-placeholder">${profile.name[0]}</div>`
        }
        <h1 class="sidebar-name">${profile.name}</h1>
        <p class="sidebar-subtitle">${profile.subtitle}</p>
        ${links ? `<div class="sidebar-links">${links}</div>` : ""}
      </div>
      <nav class="sidebar-nav">
        <h2 class="sidebar-nav-title">旅程</h2>
        <ul class="sidebar-journey-list">
          ${journeys
            .map(
              (j) => `
            <li>
              <a class="sidebar-journey-item${activeJourneyId === j.id ? " active" : ""}" href="#/journey/${j.id}">
                <span class="sidebar-journey-title">${j.title}</span>
                <span class="sidebar-journey-meta">${j.startDate} · ${j.waypoints.length} 处</span>
              </a>
            </li>
          `,
            )
            .join("")}
        </ul>
      </nav>
      ${import.meta.env.DEV ? `<a class="sidebar-editor-link" href="#/editor">+ 编辑器</a>` : ""}
    </aside>
  `;
}
