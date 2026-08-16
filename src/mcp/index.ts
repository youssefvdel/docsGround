import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Engine } from "../core/engine.js";

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
            "Search indexed official documentation or live web context for any tool, framework, or library.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query (e.g. 'how to create pipeline in ratatui', 'useState hook')",
              },
              library: {
                type: "string",
                description: "Optional library name filter (e.g. 'react', 'bun', 'xyflow')",
              },
              limit: {
                type: "number",
                description: "Max number of results to return (default: 8)",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "fetch_doc",
          description: "Retrieve the full content of a specific documentation page by ID.",
          inputSchema: {
            type: "object",
            properties: {
              doc_id: {
                type: "string",
                description: "The unique document ID returned by search_docs",
              },
            },
            required: ["doc_id"],
          },
        },
        {
          name: "scrape_and_index",
          description: "Scrape and index a new documentation site or GitHub repo into the local database.",
          inputSchema: {
            type: "object",
            properties: {
              library: {
                type: "string",
                description: "The name of the library (e.g. 'ratatui', 'xyflow')",
              },
              target: {
                type: "string",
                description: "The GitHub repo URL (e.g. 'https://github.com/ratatui/ratatui') or documentation URL",
              },
              subpath: {
                type: "string",
                description: "Subpath within the repo for docs (default: 'docs')",
              },
            },
            required: ["library", "target"],
          },
        },
        {
          name: "list_libraries",
          description: "List all indexed documentation libraries in docsGround.",
          inputSchema: {
            type: "object",
            properties: {},
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
        content: [
          {
            type: "text",
            text: JSON.stringify(res, null, 2),
          },
        ],
      };
    }

    if (name === "fetch_doc") {
      const docId = String(args?.doc_id || "");
      const doc = engine.db.getDoc(docId);
      if (!doc) {
        return {
          isError: true,
          content: [{ type: "text", text: `Document with ID "${docId}" not found.` }],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `# ${doc.title}\n\nSource: ${doc.url || doc.path}\n\n${doc.content}`,
          },
        ],
      };
    }

    if (name === "scrape_and_index") {
      const library = String(args?.library || "");
      const target = String(args?.target || "");
      const subpath = args?.subpath ? String(args.subpath) : "docs";

      try {
        const result = await engine.ingest({
          library,
          target,
          subpath,
          type: target.includes("github.com") ? "git" : "web",
        });
        return {
          content: [
            {
              type: "text",
              text: `Successfully indexed ${result.indexed} document(s) for library "${library}".`,
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to index: ${err.message}` }],
        };
      }
    }

    if (name === "list_libraries") {
      const libs = engine.db.listLibraries();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(libs, null, 2),
          },
        ],
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
