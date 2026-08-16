import { NativeMetaSearch } from "./native.js";

export interface SearxResult {
  title: string;
  url: string;
  content: string;
  engine: string;
  score?: number;
}

export class SearxClient {
  private customUrl?: string;

  constructor(customUrl?: string) {
    this.customUrl = customUrl ? customUrl.replace(/\/+$/, "") : undefined;
  }

  /**
   * Search method:
   * 1. If custom SearxNG endpoint configured by user, query it.
   * 2. Default: Run 100% internal native meta-search (Zero Docker / Zero Python / Pure TS).
   */
  public async search(query: string, limit: number = 8): Promise<SearxResult[]> {
    if (this.customUrl) {
      try {
        const url = new URL(`${this.customUrl}/search`);
        url.searchParams.set("q", query);
        url.searchParams.set("format", "json");
        url.searchParams.set("categories", "general,it");

        const res = await fetch(url.toString(), {
          headers: {
            Accept: "application/json",
            "User-Agent": "docsGround/1.0",
          },
          signal: AbortSignal.timeout(4000),
        });

        if (res.ok) {
          const data = (await res.json()) as { results?: any[] };
          if (data.results && data.results.length > 0) {
            return data.results.slice(0, limit).map((r) => ({
              title: r.title || "Untitled",
              url: r.url,
              content: r.content || "",
              engine: r.engine || "searxng",
              score: r.score,
            }));
          }
        }
      } catch {}
    }

    // Default: 100% Native Internal Meta-Search Engine
    return NativeMetaSearch.search(query, limit);
  }
}
