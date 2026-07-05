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
});
