import type { Journey } from "../data/schema.ts";
import { searchPOI } from "../lib/amap/web-service.ts";
import { createMapView, type MapViewHandle } from "../components/map-view.ts";
import { renderLayout } from "../router.ts";

interface EditorWaypoint {
  id: string;
  name: string;
  address: string;
  location: [number, number];
  date: string;
  notes: string;
}

let editorMap: MapViewHandle | null = null;
let editorWaypoints: EditorWaypoint[] = [];

export function renderEditor(container: HTMLElement): void {
  container.innerHTML = renderLayout(`
    <section class="editor-page">
      <h1>旅行编辑器</h1>
      <p class="editor-hint">开发工具：搜索 POI 添加地点，编辑后导出 JSON 文件。</p>
      <div class="editor-layout">
        <div class="editor-form">
          <div class="form-group">
            <label for="journey-title">旅程标题</label>
            <input id="journey-title" type="text" value="新旅程" />
          </div>
          <div class="form-group">
            <label for="journey-id">ID（英文标识）</label>
            <input id="journey-id" type="text" placeholder="my-journey" />
          </div>
          <div class="form-group">
            <label for="poi-search">搜索地点</label>
            <input id="poi-search" type="search" placeholder="输入地点名称..." autocomplete="off" />
            <ul id="poi-results" class="poi-results hidden"></ul>
          </div>
          <div class="form-group">
            <label>已添加地点</label>
            <ul id="waypoint-list" class="waypoint-list"></ul>
          </div>
          <div class="editor-actions">
            <button class="btn btn-primary" id="export-json" type="button">导出 JSON</button>
          </div>
          <p class="editor-export-hint">照片请放入 <code>public/media/journeys/{id}/</code></p>
        </div>
        <div class="editor-map" id="editor-map">
          <p class="editor-map-empty">添加地点后在此预览地图</p>
        </div>
      </div>
    </section>
  `);

  const searchInput = container.querySelector<HTMLInputElement>("#poi-search")!;
  const resultsEl = container.querySelector<HTMLUListElement>("#poi-results")!;
  let searchTimeout: ReturnType<typeof setTimeout>;
  let lastPois: Awaited<ReturnType<typeof searchPOI>> = [];

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    const keyword = searchInput.value.trim();
    if (keyword.length < 2) {
      resultsEl.classList.add("hidden");
      return;
    }
    searchTimeout = setTimeout(async () => {
      try {
        lastPois = await searchPOI(keyword);
        if (lastPois.length === 0) {
          resultsEl.innerHTML = `<li class="poi-empty">未找到结果</li>`;
        } else {
          resultsEl.innerHTML = lastPois
            .map(
              (poi, i) => `
              <li>
                <button type="button" class="poi-item" data-index="${i}">
                  <strong>${poi.name}</strong>
                  <span>${poi.address}</span>
                </button>
              </li>
            `,
            )
            .join("");
        }
        resultsEl.classList.remove("hidden");
      } catch {
        resultsEl.innerHTML = `<li class="poi-empty">搜索失败</li>`;
        resultsEl.classList.remove("hidden");
      }
    }, 300);
  });

  resultsEl.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest(".poi-item") as HTMLElement | null;
    if (!btn) return;
    const poi = lastPois[Number(btn.dataset.index)];
    if (!poi) return;

    editorWaypoints.push({
      id: `wp-${Date.now()}`,
      name: poi.name,
      address: poi.address,
      location: poi.location,
      date: new Date().toISOString().slice(0, 10),
      notes: "",
    });
    searchInput.value = "";
    resultsEl.classList.add("hidden");
    renderWaypointList();
    void updateEditorMap();
  });

  container.querySelector("#export-json")!.addEventListener("click", () => {
    const title =
      container.querySelector<HTMLInputElement>("#journey-title")!.value.trim() || "新旅程";
    const id =
      container.querySelector<HTMLInputElement>("#journey-id")!.value.trim() || "my-journey";
    const journey = buildJourney(id, title);
    const blob = new Blob([JSON.stringify(journey, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  renderWaypointList();
}

function buildJourney(id: string, title: string): Journey {
  return {
    id,
    title,
    startDate: editorWaypoints[0]?.date ?? new Date().toISOString().slice(0, 10),
    endDate: editorWaypoints.at(-1)?.date ?? new Date().toISOString().slice(0, 10),
    waypoints: editorWaypoints.map(({ id: wpId, name, address, location, date, notes }) => ({
      id: wpId,
      name,
      address,
      location,
      date,
      notes: notes || undefined,
    })),
    segments: editorWaypoints.slice(1).map((wp, i) => ({
      from: editorWaypoints[i].id,
      to: wp.id,
      mode: "walking" as const,
    })),
  };
}

function renderWaypointList(): void {
  const list = document.querySelector<HTMLUListElement>("#waypoint-list");
  if (!list) return;

  list.innerHTML = editorWaypoints
    .map(
      (wp, i) => `
      <li class="waypoint-item">
        <span>${wp.name}</span>
        <button type="button" class="btn-remove-waypoint" data-index="${i}">删除</button>
      </li>
    `,
    )
    .join("");

  list.querySelectorAll(".btn-remove-waypoint").forEach((btn) => {
    btn.addEventListener("click", () => {
      editorWaypoints.splice(Number((btn as HTMLElement).dataset.index), 1);
      renderWaypointList();
      void updateEditorMap();
    });
  });
}

async function updateEditorMap(): Promise<void> {
  const mapContainer = document.querySelector<HTMLDivElement>("#editor-map");
  if (!mapContainer) return;

  if (editorMap) {
    editorMap.destroy();
    editorMap = null;
  }

  if (editorWaypoints.length === 0) {
    mapContainer.innerHTML = `<p class="editor-map-empty">添加地点后在此预览地图</p>`;
    return;
  }

  mapContainer.innerHTML = "";
  editorMap = await createMapView(mapContainer, buildJourney("preview", "预览"));
}
