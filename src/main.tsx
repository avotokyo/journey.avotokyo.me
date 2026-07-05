/**
 * 应用入口：挂载 React 根节点并加载全局样式。
 *
 * 使用 StrictMode 在开发环境下对组件做双重渲染检查，
 * 帮助发现副作用与过时 API 的使用问题。
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

import "./style.css";

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
