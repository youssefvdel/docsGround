import { Engine } from "./core/engine.js";
import { createMCPServer } from "./mcp/index.js";
import { createHttpServer } from "./server/index.js";

const args = process.argv.slice(2);
const mode = args[0] || "mcp";

const engine = new Engine();

if (mode === "serve" || mode === "web") {
  const port = Number(process.env.PORT) || 3030;
  createHttpServer(engine, port);
  console.log(`⚡ docsGround Web & API Server running at http://0.0.0.0:${port}`);
} else if (mode === "mcp") {
  const mcp = createMCPServer(engine);
  await mcp.start();
} else if (mode === "ingest") {
  const library = args[1];
  const target = args[2];
  if (!library || !target) {
    console.error("Usage: docsground ingest <library> <github_repo_or_url>");
    process.exit(1);
  }
  console.log(`Ingesting ${library} from ${target}...`);
  const res = await engine.ingest({
    library,
    target,
    type: target.includes("github.com") ? "git" : "web"
  });
  console.log(`✅ Successfully indexed ${res.indexed} documents for ${library}`);
} else {
  console.log(`
docsGround ⚡ Live Agent Docs & Grounding Engine

Commands:
  bun run src/index.ts mcp             Run as Stdio MCP Server (Default)
  bun run src/index.ts serve           Start Web UI & REST API (:3030)
  bun run src/index.ts ingest <lib> <url> CLI Document Ingestion
  `);
}
