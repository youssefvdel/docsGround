export interface DocEntry {
  id: string;
  library: string;
  version: string;
  title: string;
  path: string;
  content: string;
  contentHash?: string;
  url?: string;
  headings?: string[];
  symbols?: string[];
  updatedAt: number;
}

export interface SearchResult {
  id: string;
  library: string;
  version: string;
  title: string;
  path: string;
  snippet: string;
  score: number;
  url?: string;
}

export interface IngestSource {
  library: string;
  version?: string;
  type: "git" | "web" | "searxng";
  target: string;
  subpath?: string;
}

export interface FetchOptions {
  stealthLevel?: 1 | 2 | 3;
  timeoutMs?: number;
  headers?: Record<string, string>;
}