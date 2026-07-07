/**
 * 应用路由：react-router-dom HashRouter + Routes。
 *
 * `/` 为概览，`/spot/:spotId` 打开景点详情抽屉；Hash 模式适配 GitHub Pages。
 */
import { HashRouter, Route, Routes } from "react-router-dom";

import App from "../App";

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/spot/:spotId" element={<App />} />
      </Routes>
    </HashRouter>
  );
}
