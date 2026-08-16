import { spawn, type Subprocess } from "bun";
import { join } from "path";
import { homedir } from "os";
import { existsSync, mkdirSync } from "fs";

export class EmbeddedSearxNG {
  private static process: Subprocess | null = null;
  public static port = 28080;
  public static baseUrl = `http://127.0.0.1:${EmbeddedSearxNG.port}`;

  /**
   * Ensures internal SearxNG container/binary is launched
   */
  public static async ensureRunning(): Promise<boolean> {
    // 1. Check if already answering
    try {
      const res = await fetch(`${this.baseUrl}/search?q=ping&format=json`, {
        signal: AbortSignal.timeout(1000),
      });
      if (res.ok) return true;
    } catch {}

    // 2. Launch containerized SearxNG via podman/docker if available
    const configDir = join(homedir(), ".docsground", "searxng");
    mkdirSync(configDir, { recursive: true });

    try {
      const proc = spawn([
        "podman",
        "run",
        "-d",
        "--rm",
        "--name",
        "docsground-searxng",
        "-p",
        `${this.port}:8080`,
        "-e",
        "SEARXNG_BASE_URL=http://127.0.0.1:28080",
        "-e",
        "SEARXNG_SECRET=docsground_secret_key_12345",
        "docker.io/searxng/searxng:latest",
      ], {
        stdout: "ignore",
        stderr: "ignore",
      });

      await proc.exited;

      // Wait up to 5 seconds for boot
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 500));
        try {
          const res = await fetch(`${this.baseUrl}/search?q=test&format=json`);
          if (res.ok) return true;
        } catch {}
      }
    } catch {
      // Container engine not found, fallback to public search API
    }

    return false;
  }
}
