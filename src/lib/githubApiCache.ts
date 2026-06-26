import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const CACHE_FILE = join(process.cwd(), ".cache", "github.json");
const CACHE_TTL = 4 * 60 * 60 * 1000;

let store: Record<string, { data: unknown; cachedAt: number }> | null = null;

function load() {
  if (store) return store;
  try {
    if (existsSync(CACHE_FILE))
      store = JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
  } catch {}
  store ??= {};
  return store;
}

function save() {
  mkdirSync(join(process.cwd(), ".cache"), { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(store));
}

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

export async function cachedFetch(
  url: string,
  headers: Record<string, string>,
): Promise<Response> {
  const cache = load();
  const entry = cache[url];

  if (entry && Date.now() - entry.cachedAt < CACHE_TTL) {
    return jsonResponse(entry.data);
  }

  const response = await fetch(url, { headers });
  if (response.ok) {
    const data = await response.json();
    cache[url] = { data, cachedAt: Date.now() };
    save();
    return jsonResponse(data);
  }

  if (entry) return jsonResponse(entry.data);
  return response;
}
