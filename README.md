# docsGround ⚡

> Real-time grounding & documentation engine for AI agents. Stops hallucinations via Git docs indexing, SearxNG live meta-search, and clean markdown extraction.

---

## 🏗️ Architecture

```mermaid
flowchart LR
    classDef input fill:#a5d8ff,stroke:#1971c2,color:#0b2545
    classDef process fill:#fff3bf,stroke:#f08c00,color:#4a3200
    classDef storage fill:#c3fae8,stroke:#0ca678,color:#063d2d
    classDef out fill:#b2f2bb,stroke:#2f9e44,color:#0b3d1e

    A([Git Repos / Web Docs]):::input --> G{docsGround Engine}:::process
    B([SearxNG Live Search]):::input --> G
    C([Web Extract / Fetch]):::input --> G
    G --> D[(SQLite FTS5 + Cache)]:::storage
    G --> E([MCP / CLI / HTTP API]):::out
```

---

## 🎯 Core Modules

1. **Docs Ingestion (`docs`)**
   - Direct Git clone (`--depth 1`) / raw GitHub markdown extraction.
   - Clean doc site scraping without HTML bloat.
   - SQLite FTS5 instant keyword and symbol search.

2. **Live Search (`search`)**
   - Embedded / connected SearxNG client.
   - Aggregates multi-engine real-time web results.

3. **Web Extract (`extract`)**
   - High-signal markdown cleaner (strips cookie bars, nav, JS noise).
   - Fast URL content fetcher for direct web grounding.

4. **Universal Interface**
   - Standard Model Context Protocol (MCP) server.
   - Standalone CLI & HTTP endpoint.
