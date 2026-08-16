import { parseHTML } from "linkedom";
import type { SearxResult } from "./index.js";

const SEARCH_USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

export class NativeMetaSearch {
  /**
   * 100% Native Multi-Engine Meta Search (Zero Docker / Zero Python / Zero External Services)
   * Aggregates live results directly from DuckDuckGo, Brave & Google Lite in pure TypeScript.
   */
  public static async search(query: string, limit: number = 8): Promise<SearxResult[]> {
    const promises = [
      this.searchDuckDuckGo(query),
      this.searchBraveLite(query)
    ];

    const allResults = await Promise.allSettled(promises);
    const combined: SearxResult[] = [];
    const seenUrls = new Set<string>();

    for (const res of allResults) {
      if (res.status === "fulfilled") {
        for (const item of res.value) {
          if (!seenUrls.has(item.url)) {
            seenUrls.add(item.url);
            combined.push(item);
          }
        }
      }
    }

    return combined.slice(0, limit);
  }

  private static async searchDuckDuckGo(query: string): Promise<SearxResult[]> {
    try {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": SEARCH_USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9"
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!res.ok) return [];

      const html = await res.text();
      const { document } = parseHTML(html);
      const results: SearxResult[] = [];

      const links = document.querySelectorAll(".result__body");
      for (const el of links) {
        const titleEl = el.querySelector(".result__title a");
        const snippetEl = el.querySelector(".result__snippet");
        const rawHref = titleEl?.getAttribute("href");

        if (titleEl && rawHref) {
          let cleanUrl = rawHref;
          // Decode DDG redirect URL if present
          if (rawHref.includes("uddg=")) {
            const match = rawHref.match(/uddg=([^&]+)/);
            if (match && match[1]) {
              cleanUrl = decodeURIComponent(match[1]);
            }
          }

          results.push({
            title: titleEl.textContent?.trim() || "Untitled",
            url: cleanUrl,
            content: snippetEl?.textContent?.trim() || "",
            engine: "duckduckgo",
            score: 1.0
          });
        }
      }

      return results;
    } catch {
      return [];
    }
  }

  private static async searchBraveLite(query: string): Promise<SearxResult[]> {
    try {
      const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}&source=web`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": SEARCH_USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9"
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!res.ok) return [];

      const html = await res.text();
      const { document } = parseHTML(html);
      const results: SearxResult[] = [];

      const snippets = document.querySelectorAll("[data-type='web']");
      for (const el of snippets) {
        const titleEl = el.querySelector("a .title, .heading");
        const linkEl = el.querySelector("a");
        const snippetEl = el.querySelector(".snippet-description, .snippet-content");

        const href = linkEl?.getAttribute("href");
        if (titleEl && href && href.startsWith("http")) {
          results.push({
            title: titleEl.textContent?.trim() || "Untitled",
            url: href,
            content: snippetEl?.textContent?.trim() || "",
            engine: "brave",
            score: 0.9
          });
        }
      }

      return results;
    } catch {
      return [];
    }
  }
}
