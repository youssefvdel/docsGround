import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export interface DocsGroundConfig {
  embedding: {
    provider: "local" | "openai";
    baseUrl?: string;
    apiKey?: string;
    model?: string;
  };
  search: {
    searxngUrl?: string;
    autoStartEmbedded?: boolean;
  };
  crawler: {
    maxPages: number;
    maxDepth: number;
  };
  server: {
    port: number;
    host: string;
  };
}

const DEFAULT_CONFIG: DocsGroundConfig = {
  embedding: {
    provider: "local",
    baseUrl: "http://127.0.0.1:20128/v1",
    apiKey: "",
    model: "Xenova/bge-small-en-v1.5"
  },
  search: {
    searxngUrl: "http://127.0.0.1:8888",
    autoStartEmbedded: false
  },
  crawler: {
    maxPages: 500,
    maxDepth: 4
  },
  server: {
    port: 3030,
    host: "0.0.0.0"
  }
};

export class ConfigManager {
  private static configPath = join(homedir(), ".docsground", "config.json");

  public static get(): DocsGroundConfig {
    if (!existsSync(this.configPath)) {
      this.save(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }
    try {
      const raw = readFileSync(this.configPath, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        crawler: {
          ...DEFAULT_CONFIG.crawler,
          ...(parsed.crawler || {})
        },
        embedding: {
          ...DEFAULT_CONFIG.embedding,
          ...(parsed.embedding || {})
        },
        search: {
          ...DEFAULT_CONFIG.search,
          ...(parsed.search || {})
        },
        server: {
          ...DEFAULT_CONFIG.server,
          ...(parsed.server || {})
        }
      };
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  public static save(config: Partial<DocsGroundConfig>): DocsGroundConfig {
    const current = this.get();
    const merged: DocsGroundConfig = {
      ...current,
      ...config,
      crawler: {
        ...current.crawler,
        ...(config.crawler || {})
      },
      embedding: {
        ...current.embedding,
        ...(config.embedding || {})
      },
      search: {
        ...current.search,
        ...(config.search || {})
      },
      server: {
        ...current.server,
        ...(config.server || {})
      }
    };
    const dir = join(homedir(), ".docsground");
    mkdirSync(dir, { recursive: true });
    writeFileSync(this.configPath, JSON.stringify(merged, null, 2));
    return merged;
  }
}
