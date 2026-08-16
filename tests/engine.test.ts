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
});
