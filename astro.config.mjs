import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
  site: "https://www.jiecs.top",
  base: "/boxes",
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
        },
      ],
    ],
  },
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.jiecs.top" },
      { protocol: "https", hostname: "github-readme-stats-git-main-jiesous-projects.vercel.app" },
    ],
  },
  vite: {
    plugins: [tailwindcss()]
  },
});
