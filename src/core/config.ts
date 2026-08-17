import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export interface DocsGroundConfig {
  embedding: {
    provider: "local";
    model: string;
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
    model: "Xenova/bge-small-en-v1.5"
  },
  crawler: {
    maxPages: 0, // 0 = Unlimited (indexes entire docs suite)
    maxDepth: 0  // 0 = Unlimited (crawls all submodules/traits/pages)
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
      this.persist(DEFAULT_CONFIG);
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
          provider: "local",
          model: "Xenova/bge-small-en-v1.5"
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
        maxPages: config.crawler?.maxPages !== undefined ? Number(config.crawler.maxPages) : current.crawler.maxPages,
        maxDepth: config.crawler?.maxDepth !== undefined ? Number(config.crawler.maxDepth) : current.crawler.maxDepth
      },
      embedding: {
        provider: "local",
        model: "Xenova/bge-small-en-v1.5"
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

  /** Write a full config to disk without reading it back (breaks get→save recursion on first run). */
  private static persist(config: DocsGroundConfig): void {
    const dir = join(homedir(), ".docsground");
    mkdirSync(dir, { recursive: true });
    writeFileSync(this.configPath, JSON.stringify(config, null, 2));
  }
}
