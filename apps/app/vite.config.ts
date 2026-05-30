import path from "path"
import fs from "fs"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { getServiceVersion } from "../../packages/utils/src/cloud/getVersion"


// https://vite.dev/config/
export default defineConfig(async ({ command }) => {
  const nextVersion = await bumpVersion(command);
  return {
    plugins: [react(), tailwindcss(), replaceTags(command)],
    envDir: path.resolve(__dirname, "../.."),
    base: process.env.NODE_ENV === 'production' ? `/static/app/${nextVersion}/` : "/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Source workspace packages: skip esbuild pre-bundle so Vite transforms TS/TSX and HMR stays correct.
    optimizeDeps: {
      exclude: ["@workspace/flowtrove", "@workspace/ui"],
      include: ["react-select"],
    },
    server: {
      port: 4000,
      host: "0.0.0.0",
      allowedHosts: ["uet-dev.izetmolla.com"],
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    build: {
      manifest: true,
      assetsDir: 'assets',
      outDir: 'dist',
      minify: true,
      rollupOptions: {
        input: path.resolve(__dirname, "index.html"),
        output: {
          manualChunks(id: string) {
            if (id.includes("node_modules")) {
              if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/scheduler")) {
                return "react-vendor";
              }

              if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/@hookform")) {
                return "forms-vendor";
              }

              if (id.includes("node_modules/lucide-react")) return "lucide";
              if (id.includes("node_modules/sonner")) return "sonner";
            }

            // One async chunk per `renders/<renderer>/` package (e.g. div, button). Matches
            // `lazy(() => import("./div"))` and any module under that folder. `renders/index.tsx`
            // is not under `renders/<name>/`, so it stays in `layout-builder`. Must run before
            // the blanket layout-builder rule below.

            


            const rederondifferentbundle = ["div"];
            const rendererDir = rederondifferentbundle.find(renderer => id.includes(`/layout/builder/renders/${renderer}`));
            if (rendererDir) {
              return `render-${rendererDir}`;
            } 


            // const rendererDir = id.match(
            //   /[\\/]layout[\\/]builder[\\/]renders[\\/]([^\\/]+)[\\/]/
            // )?.[1];
            // if (rendererDir) {
            //   return `layout-renderer-${rendererDir}`;
            // }

            // if (id.includes("src/components/layout/builder")) return "layout-builder";
            if (id.includes("packages/flowtrove/src/components/layout/builder")) return "layout-builder";
          }
        }
      }
    }
  }
});

function replaceTags(command: string): Plugin {
  return {
    name: "custom-html-transform",
    enforce: "pre",
    transformIndexHtml(html: string) {
      // Paths must be real files for Vite in both serve and build.
      let out = html
        .replace(/{{.theme_url}}\/src\/main\.tsx/g, '/src/main.tsx')
        .replace(/{{.base_url}}\/favicon\.svg/g, '/favicon.svg');

      // Dev-only: substitute Go template placeholders so the dev server renders.
      // On build, keep {{.title}}, {{.globalOptions}}, etc. for server-side template execution.
      if (command === 'serve') {
        out = out
          .replace(/{{.title}}/g, 'FT')
          .replace(/{{.globalOptions}}/g, '<script id="__GLOBAL_DATA__" data-app="app" type="application/json"></script>')
          .replace(/{{.globalContent}}/g, '<script id="__GLOBAL_CONTENT_DATA__" type="application/json"></script>')
          .replace(/{{ .metaData }}/g, '')
          .replace(/{{if .metaData }}/g, '')
          .replace(/{{else}}/g, '')
          .replace(/{{end}}/g, '')
          .replace(/{{if .metaData }}/g, '')
          .replace(/{{else}}/g, '')
          .replace(/{{end}}/g, '')
          .replace(/{{if .metaData }}/g, '');
      }

      return out;
    },
    closeBundle() {
      if (command !== "build") return;

      const distIndex = path.resolve(__dirname, "dist/index.html");
      if (!fs.existsSync(distIndex)) return;

      let patched = fs.readFileSync(distIndex, "utf8");
      patched = patched.replace(/(["'])\/static\//g, "$1{{.theme_url}}/static/");
      patched = patched.replace(/href="\/favicon\.svg"/g, 'href="{{.base_url}}/favicon.svg"');
      fs.writeFileSync(distIndex, patched, "utf8");
    }
  }
}


async function bumpVersion(command: string) {
  try {
    const { currentVersion } = await getServiceVersion("app");
    console.log("bumpVersion", command, currentVersion);
    const cvArray = currentVersion.split(".");
    cvArray[2] = (parseInt(cvArray[2]) + 1).toString();
    return cvArray.join(".");
  } catch (error) {
    throw new Error("bumpVersion failed: " + error);
  }
}
