import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://www.jiecs.top",
  base: "/boxes",
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
