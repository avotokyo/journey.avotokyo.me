/// <reference types="vite/client" />

/**
 * Vite 环境变量类型声明。
 *
 * 在 .env 中配置后，可通过 import.meta.env 在构建时注入。
 * 变量名必须以 VITE_ 开头才会暴露给客户端代码。
 */
interface ImportMetaEnv {
  /** 高德地图 Web 端 JS API Key，用于加载地图 SDK */
  readonly VITE_AMAP_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
