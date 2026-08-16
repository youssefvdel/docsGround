import { spawn, type Subprocess } from "bun";
import { join } from "path";
import { existsSync } from "fs";

export class EmbeddedSearxNG {
  private static process: Subprocess | null = null;
  public static port = 28080;
  public static baseUrl = `http://127.0.0.1:${EmbeddedSearxNG.port}`;

  /**
   * Spawns the bundled internal search daemon inside docsGround/searxng
   */
  public static async ensureRunning(): Promise<boolean> {
    // 1. Check if daemon already responding
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(600),
      });
      if (res.ok) return true;
    } catch {}

    // 2. Launch bundled internal Python script
    const projectDir = join(import.meta.dir, "..", "..");
    const venvPython = join(projectDir, "searxng", "venv", "bin", "python3");
    const scriptPath = join(projectDir, "searxng", "server.py");

    const pythonBin = existsSync(venvPython) ? venvPython : "python3";

    if (this.process) {
      try {
        this.process.kill();
      } catch {}
    }

    this.process = spawn([pythonBin, scriptPath, String(this.port)], {
      stdout: "ignore",
      stderr: "ignore",
    });

    this.process.unref();

    // Wait up to 3 seconds for boot
    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 400));
      try {
        const res = await fetch(`${this.baseUrl}/health`, {
          signal: AbortSignal.timeout(500),
        });
        if (res.ok) return true;
      } catch {}
    }

    return false;
  }
}
