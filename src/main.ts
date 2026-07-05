import "./style.css";
import { Router } from "./router.ts";
import { renderHome } from "./pages/home.ts";
import { renderJourneyDetail } from "./pages/journey-detail.ts";
import { renderEditor } from "./pages/editor.ts";

const app = document.querySelector<HTMLDivElement>("#app")!;
const router = new Router();

router.on("/", () => {
  void renderHome(app);
});

router.on("/journey/:id", async (params) => {
  await renderJourneyDetail(app, params.id);
});

router.on("/editor", () => {
  if (!import.meta.env.DEV) {
    window.location.hash = "#/";
    return;
  }
  renderEditor(app);
});

router.onNotFound(() => {
  app.innerHTML = `
    <section class="not-found">
      <h1>404</h1>
      <p>页面不存在</p>
      <a class="btn btn-primary" href="#/">返回首页</a>
    </section>
  `;
});

router.start();
