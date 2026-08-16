export interface SearxResult {
  title: string;
  url: string;
  content: string;
  engine: string;
  score?: number;
}

export class SearxClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.SEARXNG_URL || "http://127.0.0.1:8080") {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  public async search(query: string, limit: number = 5): Promise<SearxResult[]> {
    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("categories", "general,it");

    try {
      const res = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "User-Agent": "docsGround/1.0"
        },
        signal: AbortSignal.timeout(6000)
      });

      if (!res.ok) {
        return [];
      }

      const data = (await res.json()) as { results?: any[] };
      if (!data.results) return [];

      return data.results.slice(0, limit).map(r => ({
        title: r.title || "Untitled",
        url: r.url,
        content: r.content || "",
        engine: r.engine || "searxng",
        score: r.score
      }));
    } catch {
      return [];
    }
  }
}
