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
   * Recursive Web Docs Crawler with Real-Time Callback
   */
  public static async crawlWebDocs(
    rootUrl: string,
    maxPages: number = 500,
    maxDepth: number = 4,
    onPageFound?: (count: number, currentUrl: string) => void
  ): Promise<{ url: string; html: string; path: string }[]> {
    const originUrl = new URL(rootUrl);
    const basePath = originUrl.pathname.replace(/\/+$/, "");
    const basePrefix = `${originUrl.origin}${basePath}`;

    const visited = new Set<string>();
    const queue: { url: string; depth: number }[] = [{ url: rootUrl, depth: 0 }];
    const crawledDocs: { url: string; html: string; path: string }[] = [];

    // 2. Fast path for docs.rs crates: seed queue directly from all.html
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
            const clean = fullUrl.origin + fullUrl.pathname;
            if (clean.startsWith(basePrefix) && clean.endsWith(".html") && !clean.endsWith("all.html") && !visited.has(clean)) {
              queue.push({ url: fullUrl.href, depth: 1 });
            }
          } catch {}
        }
      } catch {}
    }

    while (queue.length > 0 && crawledDocs.length < maxPages) {
      const current = queue.shift()!;
      const cleanUrl = current.url.split("#")[0]!.replace(/\/+$/, "");

      if (visited.has(cleanUrl)) continue;
      visited.add(cleanUrl);

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

        if (current.depth < maxDepth) {
          const { document } = parseHTML(html);
          const links = Array.from(document.querySelectorAll("a[href]"))
            .map(a => a.getAttribute("href"))
            .filter(Boolean) as string[];

          for (const href of links) {
            try {
              const fullUrl = new URL(href, finalUrl);
              const cleanFull = fullUrl.origin + fullUrl.pathname;
              
              if (
                fullUrl.origin === originUrl.origin &&
                (cleanFull.startsWith(basePrefix) || cleanFull.includes(basePath)) &&
                !cleanFull.endsWith(".png") &&
                !cleanFull.endsWith(".jpg") &&
                !cleanFull.endsWith(".svg") &&
                !cleanFull.endsWith(".zip") &&
                !visited.has(cleanFull.replace(/\/+$/, ""))
              ) {
                queue.push({ url: fullUrl.href, depth: current.depth + 1 });
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error(`Failed to crawl ${current.url}:`, err);
      }
    }

    return crawledDocs;
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
