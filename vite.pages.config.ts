import { resolve } from "node:path";
import { defineConfig } from "vite";

/** Static preview site for GitHub project pages at /VHA/. */
export default defineConfig({
  base: "/VHA/",
  root: ".",
  publicDir: false,
  build: {
    outDir: "site",
    emptyOutDir: true,
    assetsInlineLimit: 1024 * 1024,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        check: resolve(__dirname, "render-check.html"),
      },
    },
  },
});
