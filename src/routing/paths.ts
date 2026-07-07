/** 景点详情路由路径 */
export function spotPath(id: string): string {
  return `/spot/${id}`;
}

/** 生成可分享的 Hash 深链接（适配 GitHub Pages） */
export function spotShareUrl(id: string): string {
  return `${window.location.origin}${window.location.pathname}#${spotPath(id)}`;
}
