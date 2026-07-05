import type { Journey } from "../data/schema.ts";

export function renderPhotoGallery(container: HTMLElement, journey: Journey): void {
  const photos = journey.waypoints.flatMap((wp) =>
    (wp.photos ?? []).map((src) => ({ src, caption: wp.name })),
  );

  if (photos.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <h3 class="panel-title">照片</h3>
    <div class="photo-grid">
      ${photos
        .map(
          (p, i) => `
        <button class="photo-thumb" type="button" data-index="${i}" aria-label="${p.caption}">
          <img src="${p.src}" alt="${p.caption}" loading="lazy" />
          <span class="photo-caption">${p.caption}</span>
        </button>
      `,
        )
        .join("")}
    </div>
    <div class="lightbox hidden" id="lightbox">
      <button class="lightbox-close" type="button" aria-label="关闭">&times;</button>
      <button class="lightbox-prev" type="button" aria-label="上一张">&#8249;</button>
      <img class="lightbox-img" src="" alt="" />
      <button class="lightbox-next" type="button" aria-label="下一张">&#8250;</button>
      <p class="lightbox-caption"></p>
    </div>
  `;

  const lightbox = container.querySelector("#lightbox") as HTMLElement;
  const img = lightbox.querySelector(".lightbox-img") as HTMLImageElement;
  const caption = lightbox.querySelector(".lightbox-caption") as HTMLElement;
  let currentIndex = 0;

  function show(index: number): void {
    currentIndex = ((index % photos.length) + photos.length) % photos.length;
    img.src = photos[currentIndex].src;
    img.alt = photos[currentIndex].caption;
    caption.textContent = photos[currentIndex].caption;
    lightbox.classList.remove("hidden");
  }

  function hide(): void {
    lightbox.classList.add("hidden");
  }

  container.querySelectorAll(".photo-thumb").forEach((el) => {
    el.addEventListener("click", () => show(Number((el as HTMLElement).dataset.index)));
  });

  lightbox.querySelector(".lightbox-close")!.addEventListener("click", hide);
  lightbox.querySelector(".lightbox-prev")!.addEventListener("click", () => show(currentIndex - 1));
  lightbox.querySelector(".lightbox-next")!.addEventListener("click", () => show(currentIndex + 1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) hide();
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("hidden")) return;
    if (e.key === "Escape") hide();
    if (e.key === "ArrowLeft") show(currentIndex - 1);
    if (e.key === "ArrowRight") show(currentIndex + 1);
  });
}
