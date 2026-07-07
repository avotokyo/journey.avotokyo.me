import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  // @ts-ignore
  plugins: [react()],
  fmt: {
    sortImports: true,
    sortPackageJson: true,
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
  build: {
    sourcemap: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 20000,
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/]react/,
              priority: 20,
            },
            {
              name: "antd",
              test: /node_modules[\\/]antd/,
              priority: 15,
            },
            {
              name: "amap",
              test: /node_modules[\\/]@amap/,
              priority: 15,
            },
            {
              name: "vendor",
              test: /node_modules/,
              priority: 10,
            },
          ],
        },
      },
    },
    license: true,
    manifest: true,
  },
});
