/**
 * 应用入口。
 *
 * ConfigProvider 提供中文 locale 与 Ant Design 默认 design token；
 * AntApp 使 message 等静态 API 继承主题上下文。
 */
import { App as AntApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <ConfigProvider locale={zhCN}>
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
);
