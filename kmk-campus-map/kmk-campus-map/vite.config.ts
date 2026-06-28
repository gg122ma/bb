// ============================================================
// 文件：vite.config.ts
// 职责：Vite 构建配置
// 重点：viteSingleFile 把所有 JS/CSS 内联进 index.html
//       所以不需要设置 base 路径，直接部署就能用
// ============================================================

import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile(), // 把所有资源内联到单一 HTML 文件
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    // viteSingleFile 需要这些设置
    assetsInlineLimit: 100000000, // 所有资源都内联（不生成独立文件）
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false, // CSS 也内联
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // 动态 import 也内联
      },
    },
  },
});
