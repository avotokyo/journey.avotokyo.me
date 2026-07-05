import { defineConfig, loadEnv } from "vite-plus";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const key = env.AMAP_WEB_SERVICE_KEY ?? "";

  return {
    plugins: [react()],
    staged: {
      "*": "vp check --fix",
    },
    fmt: {},
    lint: {
      jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
      rules: { "vite-plus/prefer-vite-plus-imports": "error" },
      options: { typeAware: true, typeCheck: true },
    },
    server: {
      proxy: {
        "/api/amap": {
          target: "https://restapi.amap.com",
          changeOrigin: true,
          rewrite: (path) => {
            const rewritten = path.replace(/^\/api\/amap/, "");
            const separator = rewritten.includes("?") ? "&" : "?";
            return `${rewritten}${separator}key=${key}`;
          },
        },
      },
    },
  };
});
