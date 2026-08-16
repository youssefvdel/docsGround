import { Database } from "bun:sqlite";
import { join } from "path";
import { homedir } from "os";
import { mkdirSync } from "fs";
import type { DocEntry, SearchResult } from "../core/types.js";

export class DocDB {
  private db: Database;

  constructor(customPath?: string) {
    const dir = customPath ? customPath : join(homedir(), ".docsground");
    mkdirSync(dir, { recursive: true });
    const dbPath = join(dir, "docs.db");

    this.db = new Database(dbPath, { create: true });
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.db.exec("PRAGMA synchronous = NORMAL;");
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS libraries (
        name TEXT PRIMARY KEY,
        latest_version TEXT NOT NULL,
        source_url TEXT,
        doc_count INTEGER DEFAULT 0,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS docs (
        id TEXT PRIMARY KEY,
        library TEXT NOT NULL,
        version TEXT NOT NULL,
        title TEXT NOT NULL,
        path TEXT NOT NULL,
        content TEXT NOT NULL,
        url TEXT,
        headings TEXT,
        symbols TEXT,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY(library) REFERENCES libraries(name) ON DELETE CASCADE
      );

      CREATE VIRTUAL TABLE IF NOT EXISTS docs_fts USING fts5(
        title,
        content,
        symbols,
        headings,
        content='docs',
        content_rowid='rowid',
        tokenize='porter unicode61'
      );

      -- Triggers to keep FTS index synced
      CREATE TRIGGER IF NOT EXISTS docs_ai AFTER INSERT ON docs BEGIN
        INSERT INTO docs_fts(rowid, title, content, symbols, headings)
        VALUES (new.rowid, new.title, new.content, new.symbols, new.headings);
      END;

      CREATE TRIGGER IF NOT EXISTS docs_ad AFTER DELETE ON docs BEGIN
        INSERT INTO docs_fts(docs_fts, rowid, title, content, symbols, headings)
        VALUES('delete', old.rowid, old.title, old.content, old.symbols, old.headings);
      END;

      CREATE TRIGGER IF NOT EXISTS docs_au AFTER UPDATE ON docs BEGIN
        INSERT INTO docs_fts(docs_fts, rowid, title, content, symbols, headings)
        VALUES('delete', old.rowid, old.title, old.content, old.symbols, old.headings);
        INSERT INTO docs_fts(rowid, title, content, symbols, headings)
        VALUES (new.rowid, new.title, new.content, new.symbols, new.headings);
      END;
    `);
  }

  public upsertDoc(doc: DocEntry): void {
    const existing = this.db.query("SELECT id FROM docs WHERE id = ?").get(doc.id);
    if (existing) {
      this.db.query(`
        UPDATE docs SET
          library = ?, version = ?, title = ?, path = ?, content = ?,
          url = ?, headings = ?, symbols = ?, updated_at = ?
        WHERE id = ?
      `).run(
        doc.library,
        doc.version,
        doc.title,
        doc.path,
        doc.content,
        doc.url || null,
        doc.headings ? JSON.stringify(doc.headings) : null,
        doc.symbols ? JSON.stringify(doc.symbols) : null,
        doc.updatedAt,
        doc.id
      );
    } else {
      this.db.query(`
        INSERT INTO docs (id, library, version, title, path, content, url, headings, symbols, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        doc.id,
        doc.library,
        doc.version,
        doc.title,
        doc.path,
        doc.content,
        doc.url || null,
        doc.headings ? JSON.stringify(doc.headings) : null,
        doc.symbols ? JSON.stringify(doc.symbols) : null,
        doc.updatedAt
      );
    }

    // Update library stats
    this.db.query(`
      INSERT INTO libraries (name, latest_version, source_url, doc_count, updated_at)
      VALUES (?, ?, ?, 1, ?)
      ON CONFLICT(name) DO UPDATE SET
        latest_version = excluded.latest_version,
        doc_count = (SELECT COUNT(*) FROM docs WHERE library = excluded.name),
        updated_at = excluded.updated_at
    `).run(doc.library, doc.version, doc.url || null, Date.now());
  }

  public search(query: string, library?: string, limit: number = 10): SearchResult[] {
    const cleanQuery = query.replace(/[^\w\s\-\.\_]/g, " ").trim();
    if (!cleanQuery) return [];

    const ftsQuery = cleanQuery.split(/\s+/).map(w => `"${w}"*`).join(" OR ");

    let sql = `
      SELECT 
        d.id, d.library, d.version, d.title, d.path, d.url,
        snippet(docs_fts, 1, '<b>', '</b>', '...', 32) AS snippet,
        bm25(docs_fts, 5.0, 1.0, 10.0, 3.0) AS score
      FROM docs_fts
      JOIN docs d ON docs_fts.rowid = d.rowid
      WHERE docs_fts MATCH ?
    `;

    const params: (string | number)[] = [ftsQuery];

    if (library) {
      sql += " AND d.library = ?";
      params.push(library);
    }

    sql += " ORDER BY score LIMIT ?";
    params.push(limit);

    try {
      const rows = this.db.query(sql).all(...params) as any[];
      return rows.map(r => ({
        id: r.id,
        library: r.library,
        version: r.version,
        title: r.title,
        path: r.path,
        snippet: r.snippet,
        score: Number(r.score),
        url: r.url || undefined
      }));
    } catch {
      return [];
    }
  }

  public listLibraries(): { name: string; latestVersion: string; docCount: number; updatedAt: number }[] {
    const rows = this.db.query("SELECT name, latest_version, doc_count, updated_at FROM libraries ORDER BY name ASC").all() as any[];
    return rows.map(r => ({
      name: r.name,
      latestVersion: r.latest_version,
      docCount: Number(r.doc_count),
      updatedAt: Number(r.updated_at)
    }));
  }

  public getDoc(id: string): DocEntry | null {
    const r = this.db.query("SELECT * FROM docs WHERE id = ?").get(id) as any;
    if (!r) return null;
    return {
      id: r.id,
      library: r.library,
      version: r.version,
      title: r.title,
      path: r.path,
      content: r.content,
      url: r.url || undefined,
      headings: r.headings ? JSON.parse(r.headings) : undefined,
      symbols: r.symbols ? JSON.parse(r.symbols) : undefined,
      updatedAt: Number(r.updated_at)
    };
  }

  public deleteLibrary(name: string): void {
    this.db.query("DELETE FROM docs WHERE library = ?").run(name);
    this.db.query("DELETE FROM libraries WHERE name = ?").run(name);
  }
}
