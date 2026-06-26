export interface Post {
  frontmatter: Frontmatter;
  Content: new (...args: any[]) => any;
  rawContent: () => string;
}

export interface Frontmatter {
  title?: string;
  url?: string;
  repo?: string;
  status?: Status;
  date?: string;
  abbrlink?: string;
  index_img?: string;
}

export type Status = "active" | "done" | "archived";

export interface RepoInfo {
  owner: string;
  name: string;
}

export interface Repo {
  stars: number;
  forks: number;
  license: string | null;
  defaultBranch: string;
  languages: LanguageEntry[];
}

export interface LanguageEntry {
  name: string;
  bytes: number;
  color: string;
  pct?: number;
}

export interface Contribution {
  repo: string;
  owner: string;
  avatarUrl: string;
  createdAt: string;
  url: string;
  number: number;
  kinds: ContributionKind[];
}

export type ContributionKind = "pr" | "issue" | "review";
