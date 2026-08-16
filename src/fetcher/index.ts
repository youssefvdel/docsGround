import type { FetchOptions } from "../core/types.js";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

export class StealthFetcher {
  /**
   * Layer 1: GitHub Raw Tree API bypass
   * Given owner/repo, fetches directory tree and raw markdown files with zero HTML rendering.
   */
  public static async fetchGitHubRepoDocs(
    repoUrl: string,
    subpath: string = "docs"
  ): Promise<{ path: string; content: string; url: string }[]> {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match || !match[1] || !match[2]) {
      throw new Error(`Invalid GitHub repository URL: ${repoUrl}`);
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, "");

    // 1. Fetch default branch tree via GitHub API
    const treeApiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;
    const res = await fetch(treeApiUrl, {
      headers: {
        "User-Agent": "docsGround/1.0",
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (!res.ok) {
      // Fallback: If API rate-limited, try raw README.md directly
      const rawReadme = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/README.md`;
      const readmeRes = await fetch(rawReadme);
      if (readmeRes.ok) {
        return [{
          path: "README.md",
          content: await readmeRes.text(),
          url: `https://github.com/${owner}/${repo}/blob/main/README.md`
        }];
      }
      throw new Error(`GitHub API error (${res.status}): ${await res.text()}`);
    }

    const data = (await res.json()) as { tree: { path: string; type: string; url: string }[] };
    const docFiles = data.tree.filter(
      item =>
        item.type === "blob" &&
        (item.path.startsWith(subpath) || item.path.toLowerCase().endsWith(".md") || item.path.toLowerCase().endsWith(".mdx") || item.path.endsWith(".d.ts"))
    );

    const results: { path: string; content: string; url: string }[] = [];

    // Concurrently fetch raw files with limit of 10
    const chunks = [];
    for (let i = 0; i < docFiles.length; i += 10) {
      chunks.push(docFiles.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async item => {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${item.path}`;
        const fileRes = await fetch(rawUrl);
        if (fileRes.ok) {
          const text = await fileRes.text();
          results.push({
            path: item.path,
            content: text,
            url: `https://github.com/${owner}/${repo}/blob/main/${item.path}`
          });
        }
      });
      await Promise.all(promises);
    }

    return results;
  }

  /**
   * Layer 2: Camouflaged HTTP/2 Request
   */
  public static async fetchWebPage(url: string, options: FetchOptions = {}): Promise<{ html: string; url: string }> {
    const headers: Record<string, string> = {
      "User-Agent": DEFAULT_USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Sec-Ch-Ua": '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Linux"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      ...options.headers
    };

    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(options.timeoutMs || 15000)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url}`);
    }

    const html = await res.text();
    return { html, url: res.url };
  }
}
