/**
 * 应用入口。
 *
 * ConfigProvider 提供中文 locale 与 Ant Design 默认 design token；
 * AntApp 使 message 等静态 API 继承主题上下文；
 * HashRouter + Routes 驱动选中态（适配 GitHub Pages）。
 */
import { App as AntApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";

import App from "./App.tsx";

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <ConfigProvider locale={zhCN}>
      <AntApp>
        <HashRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route path="spot/:spotId" />
            </Route>
          </Routes>
        </HashRouter>
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
);
