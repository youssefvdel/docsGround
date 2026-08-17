import { DocDB } from "../db/index.js";
import { StealthFetcher } from "../fetcher/index.js";
import { DocParser } from "../parser/index.js";
import { MetaSearchClient, type SearchResultItem } from "../search/index.js";
import { EmbeddingEngine } from "./embeddings.js";
import { ConfigManager } from "./config.js";
import { JobManager } from "./jobs.js";
import { EventBus } from "./events.js";
import type { IngestSource, SearchResult, DocEntry } from "./types.js";

export class Engine {
  public db: DocDB;
  public searx: MetaSearchClient;

  constructor(customDbPath?: string) {
    this.db = new DocDB(customDbPath);
    this.searx = new MetaSearchClient();
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
        let processedCount = 0;
        let newlyIndexedCount = 0;
        const total = files.length;

        if (jobId) JobManager.updateProgress(jobId, 0, total, `Found ${total} markdown files`);

        for (const file of files) {
          const parsed = DocParser.parseMarkdown(file.content, file.path);
          const contentHash = DocDB.hashContent(parsed.markdown);
          const docId = `${source.library}:${version}:${file.path}`;

          let embedding: Float32Array | undefined;
          if (!this.db.hasEmbedding(docId, source.library, contentHash)) {
            try {
              const chunkContext = (parsed.chunks || []).slice(0, 3).map(c => c.content).join("\n\n").slice(0, 1000);
              const embedText = `${parsed.title}\n${parsed.symbols.join(" ")}\n${parsed.headings.join(" | ")}\n\n${chunkContext}`;
              embedding = await EmbeddingEngine.embed(embedText);
            } catch {}
          }

          const doc: DocEntry = {
            id: docId,
            library: source.library,
            version,
            title: parsed.title,
            path: file.path,
            content: parsed.markdown,
            contentHash,
            url: file.url,
            headings: parsed.headings,
            symbols: parsed.symbols,
            updatedAt: Date.now()
          };
          const result = this.db.upsertDoc(doc, embedding);
          if (!result.skipped) newlyIndexedCount++;
          processedCount++;

          if (jobId) {
            const statusMsg = result.skipped 
              ? `Synced: ${file.path}`
              : `Indexed (${processedCount}/${total}): ${file.path}`;
            JobManager.updateProgress(jobId, processedCount, total, statusMsg);
          }
        }

        if (jobId) JobManager.completeJob(jobId, processedCount);
        return { indexed: newlyIndexedCount, library: source.library };
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

        let processedCount = 0;
        let newlyIndexedCount = 0;
        const total = crawledPages.length;

        for (const page of crawledPages) {
          const parsed = DocParser.parseHTML(page.html, page.url);
          const contentHash = DocDB.hashContent(parsed.markdown);
          const docId = `${source.library}:${version}:${page.path}`;

          let embedding: Float32Array | undefined;
          if (!this.db.hasEmbedding(docId, source.library, contentHash)) {
            try {
              const chunkContext = (parsed.chunks || []).slice(0, 3).map(c => c.content).join("\n\n").slice(0, 1000);
              const embedText = `${parsed.title}\n${parsed.symbols.join(" ")}\n${parsed.headings.join(" | ")}\n\n${chunkContext}`;
              embedding = await EmbeddingEngine.embed(embedText);
            } catch {}
          }

          const doc: DocEntry = {
            id: docId,
            library: source.library,
            version,
            title: parsed.title,
            path: page.path,
            content: parsed.markdown,
            contentHash,
            url: page.url,
            headings: parsed.headings,
            symbols: parsed.symbols,
            updatedAt: Date.now()
          };

          const result = this.db.upsertDoc(doc, embedding);
          if (!result.skipped) newlyIndexedCount++;
          processedCount++;

          EventBus.emitDocIndexed({
            library: source.library,
            docId: doc.id,
            title: doc.title,
            path: doc.path,
            symbols: doc.symbols || []
          });

          if (jobId) {
            const statusMsg = result.skipped 
              ? `Synced: ${page.path}`
              : `Indexed (${processedCount}/${total}): ${page.path}`;
            JobManager.updateProgress(jobId, processedCount, total, statusMsg);
          }
        }

        if (jobId) JobManager.completeJob(jobId, processedCount);
        return { indexed: newlyIndexedCount, library: source.library };
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

    const vectorCandidates: { doc: DocEntry; sim: number; rank: number }[] = [];
    if (queryVec) {
      const allDocs = this.db.getAllDocsWithEmbeddings(library);
      const scored: { doc: DocEntry; sim: number }[] = [];

      for (const { doc, embedding } of allDocs) {
        if (embedding) {
          const sim = EmbeddingEngine.cosineSimilarity(queryVec, embedding);
          if (sim > 0.25) {
            scored.push({ doc, sim });
          }
        }
      }

      scored.sort((a, b) => b.sim - a.sim);
      scored.slice(0, 30).forEach((item, idx) => {
        vectorCandidates.push({ doc: item.doc, sim: item.sim, rank: idx + 1 });
      });
    }

    const ftsResults = this.db.search(cleanQ, library, 30);

    // Modern Weighted Reciprocal Rank Fusion (RRF k=60) + Exact Symbol/Title Priority Boosting
    const rrfMap = new Map<string, { result: SearchResult; rrfScore: number }>();
    const k = 60;
    const lowerQ = cleanQ.toLowerCase();

    // 1. Accumulate Dense Vector RRF ranks
    for (const v of vectorCandidates) {
      const rrfContribution = 1.0 / (k + v.rank);
      rrfMap.set(v.doc.id, {
        result: {
          id: v.doc.id,
          library: v.doc.library,
          version: v.doc.version,
          title: v.doc.title,
          path: v.doc.path,
          snippet: v.doc.content.slice(0, 260) + "...",
          score: v.sim,
          url: v.doc.url
        },
        rrfScore: rrfContribution
      });
    }

    // 2. Accumulate Sparse BM25 RRF ranks + Combine
    ftsResults.forEach((f, idx) => {
      const rank = idx + 1;
      const rrfContribution = 1.0 / (k + rank);
      if (rrfMap.has(f.id)) {
        const existing = rrfMap.get(f.id)!;
        existing.rrfScore += rrfContribution;
        // Keep higher similarity score if available
      } else {
        rrfMap.set(f.id, {
          result: {
            ...f,
            snippet: f.snippet || ""
          },
          rrfScore: rrfContribution
        });
      }
    });

    // 3. Apply Exact Symbol & Heading Boosts
    for (const [id, entry] of rrfMap.entries()) {
      const titleLower = entry.result.title.toLowerCase();
      const pathLower = entry.result.path.toLowerCase();

      // Exact title match boost
      if (titleLower.includes(lowerQ) || lowerQ.includes(titleLower)) {
        entry.rrfScore += 0.015;
      }
      // Exact path / identifier match boost
      if (pathLower.includes(lowerQ)) {
        entry.rrfScore += 0.01;
      }
      // Re-scale composite score for clean readability [0.0 - 1.0]
      entry.result.score = Math.min(0.99, Number((entry.rrfScore * 28 + (entry.result.score || 0.5) * 0.3).toFixed(4)));
    }

    const fusedList = Array.from(rrfMap.values())
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .map(item => item.result);

    const localResults = fusedList.slice(0, limit);
    const isQuestionOrExploratory = /^(what|how|why|which|is|vs|compare|where|when|can|should)/i.test(cleanQ);

    if (localResults.length === 0 || isQuestionOrExploratory || !library) {
      try {
        const webResults = await this.searx.search(cleanQ, 6);
        const mappedWeb: SearchResult[] = webResults.map((w: SearchResultItem, idx: number) => ({
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
          EventBus.emitSearchFired({
            query: cleanQ,
            library,
            matchedDocIds: mappedWeb.map(r => r.id),
            source: "web"
          });
          return {
            source: "web",
            results: mappedWeb
          };
        }

        const hybridRes = [...localResults, ...mappedWeb].slice(0, limit + 4);
        EventBus.emitSearchFired({
          query: cleanQ,
          library,
          matchedDocIds: hybridRes.map(r => r.id),
          source: "hybrid"
        });
        return {
          source: "hybrid",
          results: hybridRes
        };
      } catch {}
    }

    const sourceKind = vectorCandidates.length > 0 ? "hybrid" : "fts5";
    EventBus.emitSearchFired({
      query: cleanQ,
      library,
      matchedDocIds: localResults.map(r => r.id),
      source: sourceKind
    });
    return {
      source: sourceKind,
      results: localResults
    };
  }
}
