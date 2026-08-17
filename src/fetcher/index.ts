import { parseHTML } from "linkedom";
import type { FetchOptions } from "../core/types.js";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

export class StealthFetcher {
  /**
   * Layer 1: GitHub Raw Tree API bypass
   */
  public static async fetchGitHubRepoDocs(
    repoUrl: string,
    subpath: string = ""
  ): Promise<{ path: string; content: string; url: string }[]> {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match || !match[1] || !match[2]) {
      throw new Error(`Invalid GitHub repository URL: ${repoUrl}`);
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, "");

    const treeApiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;
    const res = await fetch(treeApiUrl, {
      headers: {
        "User-Agent": "docsGround/1.0",
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (!res.ok) {
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
    const cleanSubpath = subpath ? subpath.replace(/^\/+/, "").replace(/\/+$/, "") : "";

    const docFiles = data.tree.filter(
      item =>
        item.type === "blob" &&
        (!cleanSubpath || item.path.startsWith(cleanSubpath)) &&
        (item.path.toLowerCase().endsWith(".md") || item.path.toLowerCase().endsWith(".mdx") || item.path.endsWith(".d.ts"))
    );

    const results: { path: string; content: string; url: string }[] = [];
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
   * High-Performance Concurrent Web Docs Crawler with Real-Time Progress Stream
   * Supports unlimited pages/depth (when set to 0 / Infinity) and concurrent workers
   */
  public static async crawlWebDocs(
    rootUrl: string,
    maxPages: number = 0, // 0 = Unlimited
    maxDepth: number = 0, // 0 = Unlimited
    onPageFound?: (count: number, currentUrl: string) => void
  ): Promise<{ url: string; html: string; path: string }[]> {
    const originUrl = new URL(rootUrl);
    const basePath = originUrl.pathname.replace(/\/+$/, "");
    const basePrefix = `${originUrl.origin}${basePath}`;

    // 0 or negative = Unlimited
    const effectiveMaxPages = maxPages <= 0 ? 100000 : maxPages;
    const effectiveMaxDepth = maxDepth <= 0 ? 100 : maxDepth;

    const visited = new Set<string>();
    const queued = new Set<string>();
    const queue: { url: string; depth: number }[] = [{ url: rootUrl, depth: 0 }];
    queued.add(rootUrl.split("#")[0]!.replace(/\/+$/, ""));

    const crawledDocs: { url: string; html: string; path: string }[] = [];

    // Fast path for docs.rs crates: seed queue directly from all.html
    if (originUrl.hostname === "docs.rs") {
      try {
        const allHtmlUrl = `${basePrefix}/all.html`;
        const { html: allHtml } = await this.fetchWebPage(allHtmlUrl);
        const { document } = parseHTML(allHtml);
        const links = Array.from(document.querySelectorAll("#main-content a[href], section#main-content a[href], a[href]"))
          .map(a => a.getAttribute("href"))
          .filter(Boolean) as string[];

        for (const href of links) {
          try {
            const fullUrl = new URL(href, allHtmlUrl);
            const clean = fullUrl.origin + fullUrl.pathname.replace(/\/+$/, "");
            if (clean.startsWith(basePrefix) && clean.endsWith(".html") && !clean.endsWith("all.html") && !queued.has(clean)) {
              queued.add(clean);
              queue.push({ url: fullUrl.href, depth: 1 });
            }
          } catch {}
        }
      } catch {}
    }

    const CONCURRENCY = 6;
    let activeWorkers = 0;

    return new Promise((resolve) => {
      const checkDone = () => {
        if (queue.length === 0 && activeWorkers === 0 || crawledDocs.length >= effectiveMaxPages) {
          resolve(crawledDocs);
          return true;
        }
        return false;
      };

      const worker = async () => {
        while (queue.length > 0 && crawledDocs.length < effectiveMaxPages) {
          const current = queue.shift();
          if (!current) break;

          const cleanUrl = current.url.split("#")[0]!.replace(/\/+$/, "");
          if (visited.has(cleanUrl)) continue;
          visited.add(cleanUrl);

          activeWorkers++;
          try {
            const { html, url: finalUrl } = await this.fetchWebPage(current.url);
            const parsedUrl = new URL(finalUrl);
            const relativePath = parsedUrl.pathname.replace(basePath, "") || "/";

            const docItem = {
              url: finalUrl,
              html,
              path: relativePath === "/" ? "index.html" : relativePath.replace(/^\//, "")
            };
            crawledDocs.push(docItem);

            if (onPageFound) {
              onPageFound(crawledDocs.length, docItem.path);
            }

            if (current.depth < effectiveMaxDepth && crawledDocs.length < effectiveMaxPages) {
              const { document } = parseHTML(html);
              const links = Array.from(document.querySelectorAll("a[href]"))
                .map(a => a.getAttribute("href"))
                .filter(Boolean) as string[];

              for (const href of links) {
                try {
                  const fullUrl = new URL(href, finalUrl);
                  const cleanFull = (fullUrl.origin + fullUrl.pathname).replace(/\/+$/, "");

                  if (
                    fullUrl.origin === originUrl.origin &&
                    (cleanFull.startsWith(basePrefix) || cleanFull.includes(basePath)) &&
                    !cleanFull.endsWith(".png") &&
                    !cleanFull.endsWith(".jpg") &&
                    !cleanFull.endsWith(".svg") &&
                    !cleanFull.endsWith(".zip") &&
                    !cleanFull.endsWith(".tar.gz") &&
                    !queued.has(cleanFull)
                  ) {
                    queued.add(cleanFull);
                    queue.push({ url: fullUrl.href, depth: current.depth + 1 });
                  }
                } catch {}
              }
            }
          } catch (err) {
            console.error(`Failed to crawl ${current.url}:`, err);
          } finally {
            activeWorkers--;
          }
        }

        if (!checkDone()) {
          // If items were queued by another worker while waiting, spawn next batch
          if (queue.length > 0 && activeWorkers < CONCURRENCY) {
            worker();
          }
        }
      };

      for (let i = 0; i < CONCURRENCY; i++) {
        worker();
      }
    });
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
