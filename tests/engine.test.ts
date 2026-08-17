import { describe, it, expect } from "bun:test";
import { Engine } from "../src/core/engine.js";
import { join } from "path";
import { tmpdir } from "os";

describe("docsGround Core Engine", () => {
  const testDbPath = join(tmpdir(), `test-docsground-${Date.now()}`);
  const engine = new Engine(testDbPath);

  it("should index and search markdown documents via SQLite FTS5", async () => {
    engine.db.upsertDoc({
      id: "test:1.0.0:guide",
      library: "test-lib",
      version: "1.0.0",
      title: "Getting Started with Ratatui Layouts",
      path: "/guide.md",
      content: "Ratatui allows building TUIs using Constraint::Length and Layout::default().",
      symbols: ["Constraint", "Layout"],
      updatedAt: Date.now()
    });

    const searchRes = await engine.query("Constraint Length", "test-lib");
    expect(searchRes.results.length).toBeGreaterThan(0);
    expect(searchRes.results[0]?.title).toContain("Ratatui");
    expect(searchRes.source).toBe("fts5");
  });

  it("should list indexed libraries correctly", () => {
    const libs = engine.db.listLibraries();
    expect(libs.some(l => l.name === "test-lib")).toBe(true);
  });

  it("should skip re-embedding unchanged docs (content-hash differential sync)", () => {
    const doc = {
      id: "test:2.0.0:hash.md",
      library: "test-lib",
      version: "2.0.0",
      title: "Hash Sync Test",
      path: "/hash.md",
      content: "Stable content that never changes.",
      updatedAt: Date.now()
    };

    // First insert with a real embedding → not skipped
    const emb = new Float32Array([0.1, 0.2, 0.3]);
    const first = engine.db.upsertDoc(doc, emb);
    expect(first.skipped).toBe(false);
    expect(engine.db.getDoc(doc.id)?.contentHash).toBeDefined();

    // Re-index identical content → skipped (no ONNX re-embed needed)
    const second = engine.db.upsertDoc(doc, emb);
    expect(second.skipped).toBe(true);

    // Same content but no stored embedding → must re-embed
    engine.db.upsertDoc({ ...doc, id: "test:2.0.0:no-emb.md", path: "/no-emb.md" });
    const noEmb = engine.db.upsertDoc({ ...doc, id: "test:2.0.0:no-emb.md", path: "/no-emb.md" });
    expect(noEmb.skipped).toBe(false);

    // Changed content → must re-embed
    const changed = engine.db.upsertDoc({ ...doc, content: "Changed content now.", updatedAt: Date.now() });
    expect(changed.skipped).toBe(false);
  });

  it("hasEmbedding should detect same-content docs with stored embedding", () => {
    const content = "Another stable page for hasEmbedding checks.";
    const hash = engine.db.constructor === Object ? "" : (engine.db as any).constructor.hashContent(content);
    const id = "test:3.0.0:emb-check.md";

    expect(engine.db.hasEmbedding(id, "test-lib", hash)).toBe(false);

    engine.db.upsertDoc({
      id,
      library: "test-lib",
      version: "3.0.0",
      title: "Emb Check",
      path: "/emb-check.md",
      content,
      updatedAt: Date.now()
    }, new Float32Array([0.5, 0.6]));

    expect(engine.db.hasEmbedding(id, "test-lib", hash)).toBe(true);
  });

  it("should bootstrap a fresh config on first run without recursion (regression: get→save→get stack overflow)", () => {
    const freshHome = join(tmpdir(), `docsground-fresh-${Date.now()}`);
    const proc = Bun.spawnSync({
      cmd: ["bun", "-e", "import {ConfigManager} from './src/core/config.ts'; const c = ConfigManager.get(); console.log(c.embedding.model)"],
      cwd: join(import.meta.dir, ".."),
      env: { ...process.env, HOME: freshHome },
      stdout: "pipe",
      stderr: "pipe",
      timeout: 15000
    });
    expect(proc.exitCode).toBe(0);
    expect(proc.stdout.toString()).toContain("bge");
    expect(proc.stderr.toString()).not.toContain("Maximum call stack");
  });
});
