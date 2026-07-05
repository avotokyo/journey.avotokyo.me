import type { Journey } from "../data/schema.ts";
import { staticMapUrl } from "../lib/amap/web-service.ts";

export function renderSharePanel(container: HTMLElement, journey: Journey): void {
  const shareUrl = `${window.location.origin}${window.location.pathname}#/journey/${journey.id}`;

  container.innerHTML = `
    <div class="share-panel">
      <button class="btn btn-secondary" id="copy-link" type="button">复制分享链接</button>
      <button class="btn btn-secondary" id="export-json" type="button">导出 JSON</button>
      <button class="btn btn-secondary" id="static-map" type="button">生成静态地图</button>
    </div>
    <div class="static-map-preview hidden" id="static-map-preview">
      <img id="static-map-img" src="" alt="静态地图预览" />
      <a class="btn btn-secondary" id="download-map" download="map.png" href="">下载地图</a>
    </div>
  `;

  container.querySelector("#copy-link")!.addEventListener("click", async () => {
    await navigator.clipboard.writeText(shareUrl);
    showToast("链接已复制");
  });

  container.querySelector("#export-json")!.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(journey, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${journey.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  container.querySelector("#static-map")!.addEventListener("click", () => {
    const center = journey.waypoints[0]?.location ?? [139.767, 35.681];
    const markers = journey.waypoints.map((wp) => ({ location: wp.location, label: wp.name[0] }));
    const url = staticMapUrl(center, markers);
    const preview = container.querySelector("#static-map-preview") as HTMLElement;
    const img = container.querySelector("#static-map-img") as HTMLImageElement;
    const download = container.querySelector("#download-map") as HTMLAnchorElement;
    img.src = url;
    download.href = url;
    preview.classList.remove("hidden");
  });
}

function showToast(message: string): void {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
