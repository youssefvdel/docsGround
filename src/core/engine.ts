import { DocDB } from "../db/index.js";
import { StealthFetcher } from "../fetcher/index.js";
import { DocParser } from "../parser/index.js";
import { SearxClient } from "../search/index.js";
import { EmbeddingEngine } from "./embeddings.js";
import { ConfigManager } from "./config.js";
import { JobManager } from "./jobs.js";
import type { IngestSource, SearchResult, DocEntry } from "./types.js";

export class Engine {
  public db: DocDB;
  public searx: SearxClient;

  constructor(customDbPath?: string) {
    this.db = new DocDB(customDbPath);
    this.searx = new SearxClient();
  }

  /**
   * Background Non-Blocking Ingestion with Real-time Crawling & Embedding Progress
   */
  public async ingestWithProgress(
    source: IngestSource,
    jobId?: string,
    crawlerOpts?: { maxPages?: number; maxDepth?: number }
  ): Promise<{ indexed: number; library: string }> {
    const version = source.version || "latest";
    const cfg = ConfigManager.get();
    const maxPages = crawlerOpts?.maxPages || cfg.crawler?.maxPages || 500;
    const maxDepth = crawlerOpts?.maxDepth || cfg.crawler?.maxDepth || 4;

    try {
      if (source.type === "git" || source.target.includes("github.com")) {
        if (jobId) JobManager.updateProgress(jobId, 0, 10, "Fetching GitHub file tree...");
        const files = await StealthFetcher.fetchGitHubRepoDocs(source.target, source.subpath || "");
        let count = 0;
        const total = files.length;

        if (jobId) JobManager.updateProgress(jobId, 0, total, `Found ${total} markdown files`);

        for (const file of files) {
          const parsed = DocParser.parseMarkdown(file.content, file.path);
          
          let embedding: Float32Array | undefined;
          try {
            const embedText = `${parsed.title}\n${parsed.symbols.join(" ")}\n${parsed.markdown.slice(0, 500)}`;
            embedding = await EmbeddingEngine.embed(embedText);
          } catch {}

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
          this.db.upsertDoc(doc, embedding);
          count++;

          if (jobId) {
            JobManager.updateProgress(jobId, count, total, `Indexed: ${file.path}`);
          }
        }

        if (jobId) JobManager.completeJob(jobId, count);
        return { indexed: count, library: source.library };
      } else {
        // Web Crawl with Live Found Pages Updates
        if (jobId) JobManager.updateProgress(jobId, 0, 100, "Discovering & crawling web subpages...");
        
        const crawledPages = await StealthFetcher.crawlWebDocs(
          source.target,
          maxPages,
          maxDepth,
          (foundCount, currentPath) => {
            if (jobId) {
              JobManager.updateProgress(jobId, 0, foundCount, `Discovered ${foundCount} pages: ${currentPath}`);
            }
          }
        );

        let count = 0;
        const total = crawledPages.length;

        for (const page of crawledPages) {
          const parsed = DocParser.parseHTML(page.html, page.url);

          let embedding: Float32Array | undefined;
          try {
            const embedText = `${parsed.title}\n${parsed.symbols.join(" ")}\n${parsed.markdown.slice(0, 500)}`;
            embedding = await EmbeddingEngine.embed(embedText);
          } catch {}

          const doc: DocEntry = {
            id: `${source.library}:${version}:${page.path}`,
            library: source.library,
            version,
            title: parsed.title,
            path: page.path,
            content: parsed.markdown,
            url: page.url,
            headings: parsed.headings,
            symbols: parsed.symbols,
            updatedAt: Date.now()
          };

          this.db.upsertDoc(doc, embedding);
          count++;

          if (jobId) {
            JobManager.updateProgress(jobId, count, total, `Embedded & Saved (${count}/${total}): ${page.path}`);
          }
        }

        if (jobId) JobManager.completeJob(jobId, count);
        return { indexed: count, library: source.library };
      }
    } catch (err: any) {
      if (jobId) JobManager.failJob(jobId, err.message || "Ingestion failed");
      throw err;
    }
  }

  public async ingest(
    source: IngestSource,
    crawlerOpts?: { maxPages?: number; maxDepth?: number }
  ): Promise<{ indexed: number; library: string }> {
    return this.ingestWithProgress(source, undefined, crawlerOpts);
  }

  public async query(queryText: string, library?: string, limit: number = 10): Promise<{
    source: "semantic" | "fts5" | "hybrid" | "web";
    results: SearchResult[];
  }> {
    const cleanQ = queryText.trim();
    if (!cleanQ) return { source: "fts5", results: [] };

    let queryVec: Float32Array | null = null;
    try {
      queryVec = await EmbeddingEngine.embed(cleanQ);
    } catch {}

    const vectorResults: SearchResult[] = [];
    if (queryVec) {
      const allDocs = this.db.getAllDocsWithEmbeddings(library);
      const scored: { doc: DocEntry; sim: number }[] = [];

      for (const { doc, embedding } of allDocs) {
        if (embedding) {
          const sim = EmbeddingEngine.cosineSimilarity(queryVec, embedding);
          if (sim > 0.28) {
            scored.push({ doc, sim });
          }
        }
      }

      scored.sort((a, b) => b.sim - a.sim);
      for (const item of scored.slice(0, limit)) {
        vectorResults.push({
          id: item.doc.id,
          library: item.doc.library,
          version: item.doc.version,
          title: item.doc.title,
          path: item.doc.path,
          snippet: item.doc.content.slice(0, 240) + "...",
          score: item.sim,
          url: item.doc.url
        });
      }
    }

    const ftsResults = this.db.search(cleanQ, library, limit);

    const localMergedMap = new Map<string, SearchResult>();
    for (const v of vectorResults) localMergedMap.set(v.id, v);
    for (const f of ftsResults) {
      if (!localMergedMap.has(f.id)) localMergedMap.set(f.id, f);
    }

    const localResults = Array.from(localMergedMap.values()).slice(0, limit);
    const isQuestionOrExploratory = /^(what|how|why|which|is|vs|compare|where|when|can|should)/i.test(cleanQ);

    if (localResults.length === 0 || isQuestionOrExploratory || !library) {
      try {
        const webResults = await this.searx.search(cleanQ, 6);
        const mappedWeb: SearchResult[] = webResults.map((w, idx) => ({
          id: `web:${idx}:${w.url}`,
          library: "live-web",
          version: "live",
          title: w.title,
          path: w.url,
          snippet: w.content,
          score: w.score ? Number(w.score) : 1.0,
          url: w.url
        }));

        if (localResults.length === 0) {
          return {
            source: "web",
            results: mappedWeb
          };
        }

        return {
          source: "hybrid",
          results: [...localResults, ...mappedWeb].slice(0, limit + 4)
        };
      } catch {}
    }

    return {
      source: vectorResults.length > 0 ? "hybrid" : "fts5",
      results: localResults
    };
  }
}
