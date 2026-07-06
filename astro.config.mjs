import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export default defineConfig({
  site: "https://www.jiecs.top",
  base: "/boxes",
  integrations: [
    {
      name: "external-links",
      hooks: {
        "astro:build:done": ({ dir }) => {
          const walk = (d) => {
            for (const e of readdirSync(d, { withFileTypes: true })) {
              const p = join(d, e.name);
              if (e.isDirectory()) walk(p);
              else if (e.name.endsWith(".html")) {
                let html = readFileSync(p, "utf-8");
                html = html.replace(/<a\b[^>]*>/gi, (tag) => {
                  if (!/href=["']https?:\/\//i.test(tag)) return tag;
                  if (/\btarget\s*=/i.test(tag)) return tag;
                  return tag.slice(0, -1) + ' target="_blank" rel="noopener noreferrer">';
                });
                writeFileSync(p, html);
              }
            }
          };
          walk(dir.pathname);
        },
      },
    },
  ],
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.jiecs.top" },
      { protocol: "https", hostname: "github-readme-stats-git-main-jiesous-projects.vercel.app" },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
