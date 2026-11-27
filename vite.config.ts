import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig(({ command }) => {
  if (command === "serve") {
    return {
      root: ".",
      server: { host: true, port: 4174, strictPort: true },
    };
  }

  return {
    publicDir: false,
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "VHA",
        formats: ["es"],
        fileName: () => "vha.js",
      },
      // Not named "dist": HACS also looks in repo root; the built file is copied to ./vha.js
      outDir: "release",
      emptyOutDir: true,
      cssCodeSplit: false,
      assetsInlineLimit: 1024 * 1024,
      target: "es2020",
      sourcemap: false,
      rollupOptions: {
        output: { inlineDynamicImports: true },
      },
    },
  };
});
