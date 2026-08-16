import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { Engine } from "../src/core/engine.js";
import { createHttpServer } from "../src/server/index.js";
import { ConfigManager } from "../src/core/config.js";
import { join } from "path";
import { tmpdir } from "os";

describe("docsGround End-to-End Suite", () => {
  const testDbDir = join(tmpdir(), `docsground-e2e-${Date.now()}`);
  let engine: Engine;
  let server: any;
  const testPort = 3039;

  beforeAll(async () => {
    engine = new Engine(testDbDir);
    server = createHttpServer(engine, testPort);
  });

  afterAll(() => {
    if (server) server.stop();
  });

  it("1. Should ingest a raw markdown document into SQLite FTS5 & Vector Store", async () => {
    engine.db.upsertDoc({
      id: "ratatui:0.29.0:layout.md",
      library: "ratatui",
      version: "0.29.0",
      title: "Ratatui Layout Engine",
      path: "/docs/layout.md",
      content: "The Layout struct allows dividing the terminal screen into Constraint chunks such as Length(10) or Min(20).",
      symbols: ["Layout", "Constraint"],
      updatedAt: Date.now()
    });

    const doc = engine.db.getDoc("ratatui:0.29.0:layout.md");
    expect(doc).not.toBeNull();
    expect(doc?.title).toBe("Ratatui Layout Engine");
    expect(doc?.symbols).toContain("Layout");
  });

  it("2. Should query documents with BM25 FTS5 ranking and return snippets", async () => {
    const res = await engine.query("Constraint chunks", "ratatui");
    expect(res.source).toBe("fts5");
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.results[0]?.title).toBe("Ratatui Layout Engine");
    expect(res.results[0]?.snippet).toContain("Constraint");
  });

  it("3. Should serve REST API search endpoint /api/search", async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/search?q=Layout&library=ratatui`);
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.results.length).toBeGreaterThan(0);
    expect(data.results[0].title).toBe("Ratatui Layout Engine");
  });

  it("4. Should serve REST API libraries endpoint /api/libraries", async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/libraries`);
    expect(res.status).toBe(200);
    const libs = await res.json() as any[];
    expect(libs.some(l => l.name === "ratatui")).toBe(true);
  });

  it("5. Should read and update persistent configuration via /api/config", async () => {
    const getRes = await fetch(`http://127.0.0.1:${testPort}/api/config`);
    expect(getRes.status).toBe(200);
    const cfg = await getRes.json() as any;
    expect(cfg.server.port).toBeDefined();

    // Update config
    const postRes = await fetch(`http://127.0.0.1:${testPort}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embedding: { provider: "openai", baseUrl: "http://127.0.0.1:20128/v1", model: "bge-m3" }
      })
    });
    expect(postRes.status).toBe(200);
    const postData = await postRes.json() as any;
    expect(postData.config.embedding.provider).toBe("openai");
    expect(postData.config.embedding.model).toBe("bge-m3");
  });

  it("6. Should render the Web UI HTML dashboard at /", async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("docsGround");
    expect(html).toContain("/app.js");

    const appRes = await fetch(`http://127.0.0.1:${testPort}/app.js`);
    expect(appRes.status).toBe(200);
    const appJs = await appRes.text();
    expect(appJs).toContain("Embedding Provider");
  });
});
