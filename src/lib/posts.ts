import langColors from "../data/colors.json";
import { cachedFetch } from "./githubApiCache";
import type {
  Contribution,
  ContributionKind,
  Frontmatter,
  Repo,
  LanguageEntry,
  Post,
  RepoInfo,
} from "../types";

export function makeSlug(f: Frontmatter): string {
  return f.abbrlink && f.title
    ? `${f.abbrlink}-${f.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "")}`
    : f.abbrlink || "";
}

function langColor(name: string): string {
  return (langColors as Record<string, string | null>)[name] ?? "#888";
}

function parseRepo(url: string): RepoInfo | null {
  const m = url.match(/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\/|$)/);
  return m ? { owner: m[1], name: m[2] } : null;
}

const GH_TOKEN = import.meta.env.GITHUB_TOKEN as string | undefined;
const GH_HEADERS: Record<string, string> = {
  Authorization: `Bearer ${GH_TOKEN}`,
};

function ghFetch(url: string): Promise<Response> {
  return cachedFetch(url, GH_HEADERS);
}

async function fetchGitHubRepo(r: RepoInfo): Promise<Repo | null> {
  try {
    const repoUrl = `https://api.github.com/repos/${r.owner}/${r.name}`;
    const repoRes = await ghFetch(repoUrl);
    if (!repoRes.ok) return null;
    const repo = await repoRes.json();
    const langRes = await ghFetch(
      `https://api.github.com/repos/${r.owner}/${r.name}/languages`,
    );
    const langData: Record<string, number> = langRes.ok
      ? await langRes.json()
      : {};
    const languages: LanguageEntry[] = Object.entries(langData)
      .map(([name, bytes]) => ({ name, bytes, color: langColor(name) }))
      .sort((a, b) => b.bytes - a.bytes);
    return {
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      license: repo.license?.spdx_id ?? null,
      defaultBranch: repo.default_branch ?? "main",
      languages,
    };
  } catch {
    return null;
  }
}

async function fetchContributions(username: string): Promise<Contribution[]> {
  try {
    const queries: { q: string; kind: ContributionKind }[] = [
      { q: `author:${username}+is:pr`, kind: "pr" },
      { q: `author:${username}+is:issue`, kind: "issue" },
      { q: `reviewed-by:${username}`, kind: "review" },
    ];

    const allItems = (
      await Promise.all(
        queries.map(async ({ q, kind }) => {
          const url = `https://api.github.com/search/issues?q=${q}&per_page=100&sort=created&order=desc`;
          const res = await ghFetch(url);
          if (!res.ok) return [];
          const data = await res.json();
          return (data.items ?? []).map((item: any) => ({ item, kind }));
        }),
      )
    ).flat();

    const merged = new Map<string, Contribution>();
    for (const { item, kind } of allItems) {
      const m = item.repository_url?.match(/repos\/([^/]+)\/([^/]+)/);
      if (!m) continue;
      const owner = m[1];
      const name = m[2];
      if (owner.toLowerCase() === username.toLowerCase()) continue;
      const key = `${owner}/${name}#${item.number}`;
      const existing = merged.get(key);
      if (existing) {
        if (!existing.kinds.includes(kind)) existing.kinds.push(kind);
      } else {
        merged.set(key, {
          repo: `${name}`,
          owner,
          avatarUrl: "",
          createdAt: item.created_at ?? "",
          url: item.html_url ?? "",
          number: item.number,
          kinds: [kind],
        });
      }
    }

    const items = [...merged.values()];
    const owners = new Set(items.map((i) => i.owner));

    const avatarResults = await Promise.all(
      [...owners].map(async (o) => {
        const r = await ghFetch(`https://api.github.com/users/${o}`);
        const u = r.ok
          ? (await r.json()).avatar_url
          : `https://github.com/${o}.png`;
        return [o, u] as const;
      }),
    );
    const avatarUrls = new Map(avatarResults);
    for (const item of items) {
      const u = avatarUrls.get(item.owner);
      if (u) item.avatarUrl = u;
    }

    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function getSortedPosts(boxesGlob: Record<string, Post>) {
  const raw = Object.values(boxesGlob);

  const results: { post: Post; repo: Repo | null }[] = await Promise.all(
    raw.map(async (p) => {
      const repo = p.frontmatter.repo ? parseRepo(p.frontmatter.repo) : null;
      const gh = repo ? await fetchGitHubRepo(repo) : null;
      return { post: p, repo: gh };
    }),
  );

  const allPosts = results.sort((a, b) => {
    const da = a.post.frontmatter.date;
    const db = b.post.frontmatter.date;
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return db.localeCompare(da);
  });

  const publicPosts = allPosts.filter((r) => !r.post.frontmatter.secret);
  const secret = allPosts.filter((r) => r.post.frontmatter.secret);
  const contributions = await fetchContributions("jiesou");

  return { allPosts, publicPosts, secret, contributions };
}
