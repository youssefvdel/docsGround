import { DocDB } from "../db/index.js";
import { StealthFetcher } from "../fetcher/index.js";
import { DocParser } from "../parser/index.js";
import { SearxClient } from "../search/index.js";
import type { IngestSource, SearchResult, DocEntry } from "./types.js";

export class Engine {
  public db: DocDB;
  public searx: SearxClient;

  constructor(customDbPath?: string) {
    this.db = new DocDB(customDbPath);
    this.searx = new SearxClient();
  }

  /**
   * Ingest a documentation source (Git repo or Web URL)
   */
  public async ingest(source: IngestSource): Promise<{ indexed: number; library: string }> {
    const version = source.version || "latest";

    if (source.type === "git" || source.target.includes("github.com")) {
      const files = await StealthFetcher.fetchGitHubRepoDocs(source.target, source.subpath || "docs");
      let count = 0;

      for (const file of files) {
        const parsed = DocParser.parseMarkdown(file.content, file.path);
        const doc: DocEntry = {
          id: `${source.library}:${version}:${file.path}`,
          library: source.library,
          version,
          title: parsed.title,
          path: file.path,
          content: parsed.markdown,
          url: file.url,
          headings: parsed.headings,
          symbols: parsed.symbols,
          updatedAt: Date.now()
        };
        this.db.upsertDoc(doc);
        count++;
      }

      return { indexed: count, library: source.library };
    } else {
      // Single web page scraping
      const { html, url } = await StealthFetcher.fetchWebPage(source.target);
      const parsed = DocParser.parseHTML(html, url);
      const path = new URL(url).pathname || "/";

      const doc: DocEntry = {
        id: `${source.library}:${version}:${path}`,
        library: source.library,
        version,
        title: parsed.title,
        path,
        content: parsed.markdown,
        url,
        headings: parsed.headings,
        symbols: parsed.symbols,
        updatedAt: Date.now()
      };

      this.db.upsertDoc(doc);
      return { indexed: 1, library: source.library };
    }
  }

  /**
   * Universal Smart Query:
   * 1. Searches SQLite FTS5 for indexed docs.
   * 2. If zero hits, queries SearxNG and returns live web context.
   */
  public async query(queryText: string, library?: string, limit: number = 8): Promise<{
    source: "fts5" | "searxng" | "mixed";
    results: SearchResult[];
  }> {
    const ftsResults = this.db.search(queryText, library, limit);

    if (ftsResults.length > 0) {
      return { source: "fts5", results: ftsResults };
    }

    // Fallback: Query SearxNG for live web results
    const webResults = await this.searx.search(queryText, 5);
    const mappedWeb: SearchResult[] = webResults.map((w, idx) => ({
      id: `web:${idx}:${w.url}`,
      library: library || "web",
      version: "live",
      title: w.title,
      path: w.url,
      snippet: w.content,
      score: w.score ? Number(w.score) : 0,
      url: w.url
    }));

    return {
      source: "searxng",
      results: mappedWeb
    };
  }
}
