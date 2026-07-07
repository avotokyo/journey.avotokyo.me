/** 从当前 URL Hash 解析景点 id，格式为 #/spot/:id */
export function getSpotIdFromHash(): string | undefined {
  return location.hash.match(/^#\/spot\/([^/?#]+)/)?.[1];
}

/**
 * 订阅 Hash 变化，供 useSyncExternalStore 使用。
 * 浏览器前进/后退或直接修改 Hash 时，React 组件会自动重新渲染。
 */
export function subscribeSpotId(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/** 打开景点详情：写入 Hash 触发全局状态更新 */
export function openSpot(id: string): void {
  location.hash = `#/spot/${id}`;
}

/** 关闭景点详情：清空 Hash 回到概览视图 */
export function closeSpot(): void {
  location.hash = "#/";
}
