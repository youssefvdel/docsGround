import { join } from "path";
import { homedir } from "os";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";

export interface DocsGroundConfig {
  embedding: {
    provider: "local" | "openai";
    baseUrl?: string;
    apiKey?: string;
    model?: string;
  };
  search: {
    searxngUrl: string;
    autoStartEmbedded: boolean;
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
    model: "text-embedding-3-small"
  },
  search: {
    searxngUrl: process.env.SEARXNG_URL || "http://127.0.0.1:8888",
    autoStartEmbedded: false
  },
  server: {
    port: 3030,
    host: "0.0.0.0"
  }
};

export class ConfigManager {
  private static configPath = join(homedir(), ".docsground", "config.json");
  private static cachedConfig: DocsGroundConfig | null = null;

  public static get(): DocsGroundConfig {
    if (this.cachedConfig) return this.cachedConfig;

    const dir = join(homedir(), ".docsground");
    mkdirSync(dir, { recursive: true });

    if (!existsSync(this.configPath)) {
      writeFileSync(this.configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
      this.cachedConfig = DEFAULT_CONFIG;
      return DEFAULT_CONFIG;
    }

    try {
      const raw = readFileSync(this.configPath, "utf-8");
      this.cachedConfig = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
      return this.cachedConfig!;
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  public static save(newConfig: Partial<DocsGroundConfig>): DocsGroundConfig {
    const current = this.get();
    const merged: DocsGroundConfig = {
      ...current,
      ...newConfig,
      embedding: { ...current.embedding, ...(newConfig.embedding || {}) },
      search: { ...current.search, ...(newConfig.search || {}) },
      server: { ...current.server, ...(newConfig.server || {}) }
    };

    writeFileSync(this.configPath, JSON.stringify(merged, null, 2));
    this.cachedConfig = merged;
    return merged;
  }
}
