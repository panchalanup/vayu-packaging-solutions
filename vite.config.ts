import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Packages that are only ever loaded with a dynamic import (PDF export, scroll animation, model export...).
  // Vite does not see them at startup, so in dev it would bundle them on first use, answer "504 Outdated Optimize Dep"
  // and the click that needed them would fail (the designer's PDF buttons). Listing them bundles them up front.
  optimizeDeps: {
    include: [
      "jspdf",
      "jspdf-autotable",
      "gsap",
      "gsap/ScrollTrigger",
      "lenis",
      "react-dom/server",
      "three/examples/jsm/exporters/GLTFExporter.js",
      "three/examples/jsm/exporters/USDZExporter.js",
      "@fingerprintjs/fingerprintjs",
    ],
  },
  build: {
    rollupOptions: {
      output: {
        // Heavy libraries get their own chunks so they only download on the routes that use them
        manualChunks(id) {
          if (id.includes("vite/preload-helper") || id.includes("commonjsHelpers")) return "helpers";
          if (!id.includes("node_modules")) return undefined;
          // Shared runtime first, otherwise Rollup hoists React/helpers into the heavy chunks and the entry imports them eagerly
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          if (/[\\/]@babel[\\/]runtime[\\/]/.test(id)) return "helpers";
          if (/[\\/](three|three-mesh-bvh|@react-three|maath|postprocessing)[\\/]/.test(id)) return "three";
          if (/[\\/](jspdf|jspdf-autotable|html2canvas|canvg|dompurify)[\\/]/.test(id)) return "pdf";
          if (/[\\/]gsap[\\/]/.test(id)) return "gsap";
          if (/[\\/](react-markdown|remark-[^\\/]+|rehype-[^\\/]+|micromark[^\\/]*|mdast-[^\\/]+|hast-[^\\/]+|unified)[\\/]/.test(id)) return "markdown";
          return undefined;
        },
      },
    },
  },
}));
