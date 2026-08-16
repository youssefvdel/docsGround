import { Database } from "bun:sqlite";
import { join } from "path";
import { homedir } from "os";
import { mkdirSync } from "fs";
import type { DocEntry, SearchResult } from "../core/types.js";

export class DocDB {
  public db: Database;

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
        embedding BLOB,
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

    try {
      this.db.exec("ALTER TABLE docs ADD COLUMN embedding BLOB;");
    } catch {}
  }

  public upsertDoc(doc: DocEntry, embedding?: Float32Array): void {
    const existing = this.db.query("SELECT id FROM docs WHERE id = ?").get(doc.id);
    const embBuffer = embedding ? Buffer.from(embedding.buffer) : null;

    if (existing) {
      this.db.query(`
        UPDATE docs SET
          library = ?, version = ?, title = ?, path = ?, content = ?,
          url = ?, headings = ?, symbols = ?, embedding = coalesce(?, embedding), updated_at = ?
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
        embBuffer,
        doc.updatedAt,
        doc.id
      );
    } else {
      this.db.query(`
        INSERT INTO docs (id, library, version, title, path, content, url, headings, symbols, embedding, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        embBuffer,
        doc.updatedAt
      );
    }

    // Append / update source_url list in library table
    const currentLib = this.db.query("SELECT source_url FROM libraries WHERE name = ?").get(doc.library) as any;
    let urlList: string[] = [];
    if (currentLib && currentLib.source_url) {
      try {
        urlList = JSON.parse(currentLib.source_url);
        if (!Array.isArray(urlList)) urlList = [currentLib.source_url];
      } catch {
        urlList = [currentLib.source_url];
      }
    }
    if (doc.url && !urlList.includes(doc.url)) {
      urlList.push(doc.url);
    }

    this.db.query(`
      INSERT INTO libraries (name, latest_version, source_url, doc_count, updated_at)
      VALUES (?, ?, ?, 1, ?)
      ON CONFLICT(name) DO UPDATE SET
        latest_version = excluded.latest_version,
        source_url = ?,
        doc_count = (SELECT COUNT(*) FROM docs WHERE library = excluded.name),
        updated_at = excluded.updated_at
    `).run(doc.library, doc.version, JSON.stringify(urlList), Date.now(), JSON.stringify(urlList));
  }

  public updateLibrarySourceUrl(name: string, sourceUrl: string): void {
    let urls: string[] = [];
    try {
      urls = JSON.parse(sourceUrl);
      if (!Array.isArray(urls)) urls = [sourceUrl];
    } catch {
      urls = [sourceUrl];
    }
    this.db.query("UPDATE libraries SET source_url = ?, updated_at = ? WHERE name = ?").run(
      JSON.stringify(urls),
      Date.now(),
      name
    );
  }

  public search(query: string, library?: string, limit: number = 10): SearchResult[] {
    const cleanQuery = query.replace(/[^\w\s\-\.\_]/g, " ").trim();
    if (!cleanQuery) return [];

    const ftsQuery = cleanQuery.split(/\s+/).map(w => `"${w}"*`).join(" OR ");

    let sql = `
      SELECT 
        d.id, d.library, d.version, d.title, d.path, d.url,
        snippet(docs_fts, 1, '<mark class="bg-yellow-500/30 text-yellow-200 px-0.5 rounded">', '</mark>', '...', 32) AS snippet,
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

  public getDocsByLibrary(library: string): { id: string; title: string; path: string; headings?: string[]; symbols?: string[] }[] {
    const rows = this.db.query("SELECT id, title, path, headings, symbols FROM docs WHERE library = ? ORDER BY path ASC").all(library) as any[];
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      path: r.path,
      headings: r.headings ? JSON.parse(r.headings) : undefined,
      symbols: r.symbols ? JSON.parse(r.symbols) : undefined
    }));
  }

  public getAllDocsWithEmbeddings(library?: string): { doc: DocEntry; embedding: Float32Array | null }[] {
    let sql = "SELECT * FROM docs";
    const params: any[] = [];
    if (library) {
      sql += " WHERE library = ?";
      params.push(library);
    }

    const rows = this.db.query(sql).all(...params) as any[];
    return rows.map(r => {
      let vec: Float32Array | null = null;
      if (r.embedding) {
        const buf = Buffer.from(r.embedding);
        vec = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
      }
      return {
        doc: {
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
        },
        embedding: vec
      };
    });
  }

  public listLibraries(): { name: string; latestVersion: string; sourceUrl: string; docCount: number; updatedAt: number }[] {
    const rows = this.db.query("SELECT name, latest_version, source_url, doc_count, updated_at FROM libraries ORDER BY name ASC").all() as any[];
    return rows.map(r => ({
      name: r.name,
      latestVersion: r.latest_version,
      sourceUrl: r.source_url || "",
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

  public renameLibrary(oldName: string, newName: string): boolean {
    const cleanOld = oldName.trim().toLowerCase();
    const cleanNew = newName.trim().toLowerCase();
    if (!cleanNew || cleanOld === cleanNew) return false;

    this.db.query("UPDATE libraries SET name = ? WHERE name = ?").run(cleanNew, cleanOld);

    const docs = this.db.query("SELECT id, path, version FROM docs WHERE library = ?").all(cleanOld) as any[];
    for (const d of docs) {
      const newId = `${cleanNew}:${d.version}:${d.path}`;
      this.db.query("UPDATE docs SET id = ?, library = ? WHERE id = ?").run(newId, cleanNew, d.id);
    }
    return true;
  }
}
