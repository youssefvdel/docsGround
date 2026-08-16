import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Engine } from "../core/engine.js";
import { StealthFetcher } from "../fetcher/index.js";

export function createMCPServer(engine: Engine) {
  const server = new Server(
    {
      name: "docsGround",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "search_docs",
          description:
            "Search indexed official documentation via hybrid vector semantic similarity and BM25 FTS5 exact matching. Automatically falls back to live web search if no local docs exist.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query or concept (e.g. 'ratatui layout constraint', 'bun sqlite WAL', 'what is faster rust or bun')",
              },
              library: {
                type: "string",
                description: "Optional library filter",
              },
              limit: {
                type: "number",
                description: "Max results (default: 8)",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "web_search",
          description: "Perform real-time multi-engine meta-search across DuckDuckGo, Brave, and GitHub.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Web search query",
              },
              limit: {
                type: "number",
                description: "Max search results (default: 8)",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "web_extract",
          description: "Extract clean readable Markdown content directly from any live website URL.",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "The webpage URL to fetch and convert to Markdown",
              },
            },
            required: ["url"],
          },
        },
        {
          name: "fetch_doc",
          description: "Retrieve full content of a specific indexed doc page by ID or path.",
          inputSchema: {
            type: "object",
            properties: {
              doc_id: {
                type: "string",
                description: "Document ID or URL",
              },
            },
            required: ["doc_id"],
          },
        },
        {
          name: "scrape_and_index",
          description: "Autonomous indexing: Crawls and indexes a documentation site (docs.rs, framework manual) or GitHub repository into local SQLite FTS5 & Vector Store.",
          inputSchema: {
            type: "object",
            properties: {
              library: {
                type: "string",
                description: "Library name (e.g. 'tauri', 'axum', 'tokio')",
              },
              targets: {
                type: "array",
                items: { type: "string" },
                description: "One or more documentation URLs or GitHub repository links",
              },
              target: {
                type: "string",
                description: "Single documentation URL or GitHub repository link (shorthand)",
              },
              subpath: {
                type: "string",
                description: "GitHub subpath filter (default: empty for all markdown files)",
              },
              clean_reindex: {
                type: "boolean",
                description: "Whether to wipe older pages before re-indexing (default: false)",
              },
            },
            required: ["library"],
          },
        },
        {
          name: "list_libraries",
          description: "List all indexed libraries, document counts, and versions in the knowledge base.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "delete_library",
          description: "Delete an indexed library and its associated documents from the knowledge base.",
          inputSchema: {
            type: "object",
            properties: {
              library: {
                type: "string",
                description: "Library name to delete",
              },
            },
            required: ["library"],
          },
        },
        {
          name: "rename_library",
          description: "Rename an indexed library and update all associated documents.",
          inputSchema: {
            type: "object",
            properties: {
              old_name: {
                type: "string",
                description: "Current library name",
              },
              new_name: {
                type: "string",
                description: "New library name",
              },
            },
            required: ["old_name", "new_name"],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "search_docs") {
      const query = String(args?.query || "");
      const library = args?.library ? String(args.library) : undefined;
      const limit = args?.limit ? Number(args.limit) : 8;

      const res = await engine.query(query, library, limit);
      return {
        content: [{ type: "text", text: JSON.stringify(res, null, 2) }],
      };
    }

    if (name === "web_search") {
      const query = String(args?.query || "");
      const limit = args?.limit ? Number(args.limit) : 8;

      const res = await engine.searx.search(query, limit);
      return {
        content: [{ type: "text", text: JSON.stringify({ query, results: res }, null, 2) }],
      };
    }

    if (name === "web_extract") {
      const targetUrl = String(args?.url || "");
      try {
        const { html, url } = await StealthFetcher.fetchWebPage(targetUrl);
        return {
          content: [{ type: "text", text: `Fetched from: ${url}\n\n${html.slice(0, 15000)}` }],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to extract: ${err.message}` }],
        };
      }
    }

    if (name === "fetch_doc") {
      const docId = String(args?.doc_id || "");
      const doc = engine.db.getDoc(docId);
      if (!doc) {
        return {
          isError: true,
          content: [{ type: "text", text: `Document "${docId}" not found.` }],
        };
      }
      return {
        content: [{ type: "text", text: `# ${doc.title}\n\nLibrary: ${doc.library} (${doc.version})\nSource: ${doc.url || doc.path}\n\n${doc.content}` }],
      };
    }

    if (name === "scrape_and_index") {
      const library = String(args?.library || "").trim().toLowerCase();
      const rawTargets = args?.targets || args?.target || [];
      const targets = Array.isArray(rawTargets) ? rawTargets : [String(rawTargets)];
      const subpath = args?.subpath ? String(args.subpath).trim() : "";
      const cleanReindex = Boolean(args?.clean_reindex);

      if (targets.length === 0) {
        return {
          isError: true,
          content: [{ type: "text", text: "At least one target URL is required." }],
        };
      }

      if (cleanReindex) {
        engine.db.deleteLibrary(library);
      }

      let totalIndexed = 0;
      for (const t of targets) {
        const targetStr = String(t);
        const result = await engine.ingest({
          library,
          target: targetStr,
          subpath,
          type: targetStr.includes("github.com") ? "git" : "web",
        });
        totalIndexed += result.indexed;
      }

      return {
        content: [{ type: "text", text: `Successfully indexed ${totalIndexed} doc(s) for "${library}".` }],
      };
    }

    if (name === "list_libraries") {
      const libs = engine.db.listLibraries();
      return {
        content: [{ type: "text", text: JSON.stringify(libs, null, 2) }],
      };
    }

    if (name === "delete_library") {
      const lib = String(args?.library || "").trim().toLowerCase();
      engine.db.deleteLibrary(lib);
      return {
        content: [{ type: "text", text: `Library "${lib}" and all its documents were deleted.` }],
      };
    }

    if (name === "rename_library") {
      const oldName = String(args?.old_name || "").trim().toLowerCase();
      const newName = String(args?.new_name || "").trim().toLowerCase();
      const ok = engine.db.renameLibrary(oldName, newName);
      return {
        content: [{ type: "text", text: ok ? `Renamed "${oldName}" to "${newName}".` : `Failed to rename "${oldName}".` }],
      };
    }

    return {
      isError: true,
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
    };
  });

  return {
    async start() {
      const transport = new StdioServerTransport();
      await server.connect(transport);
    },
  };
}
