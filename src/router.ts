type RouteHandler = (params: Record<string, string>) => void | Promise<void>;

interface Route {
  pattern: RegExp;
  keys: string[];
  handler: RouteHandler;
}

export class Router {
  private routes: Route[] = [];
  private notFound: RouteHandler = () => {};

  on(path: string, handler: RouteHandler): this {
    const keys: string[] = [];
    const patternStr = path.replace(/:([a-zA-Z]+)/g, (_, key) => {
      keys.push(key);
      return "([^/]+)";
    });
    this.routes.push({
      pattern: new RegExp(`^${patternStr}$`),
      keys,
      handler,
    });
    return this;
  }

  onNotFound(handler: RouteHandler): this {
    this.notFound = handler;
    return this;
  }

  navigate(hash: string): void {
    window.location.hash = hash;
  }

  start(): void {
    window.addEventListener("hashchange", () => void this.resolve());
    void this.resolve();
  }

  private async resolve(): Promise<void> {
    const path = window.location.hash.slice(1) || "/";

    for (const route of this.routes) {
      const match = path.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.keys.forEach((key, i) => {
          params[key] = match[i + 1];
        });
        await route.handler(params);
        return;
      }
    }

    await this.notFound({});
  }
}

export function renderLayout(content: string): string {
  return `
    <header class="site-header">
      <a class="site-logo" href="#/">Journey</a>
      ${import.meta.env.DEV ? '<a class="site-nav-link" href="#/editor">编辑器</a>' : ""}
    </header>
    <main class="site-main">${content}</main>
    <footer class="site-footer">
      <p>Powered by 高德地图 · journey.avotokyo.me</p>
    </footer>
  `;
}
