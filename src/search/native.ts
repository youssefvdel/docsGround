import { parseHTML } from "linkedom";
import type { SearxResult } from "./index.js";

/**
 * Stealth meta-search: browser-fidelity headers, rotating UA pool, per-engine
 * session cookies and structured endpoints (Bing RSS, DDG Lite) so engines
 * don't JS-wall or rate-limit a bare HTTP client.
 *
 * Strategy per engine:
 *  - Bing        : RSS feed endpoint (structured XML, no HTML parsing, no JS wall)
 *  - DuckDuckGo  : Lite HTML endpoint (lenient, low bot pressure)
 *  - Brave       : HTML result blocks (best structured selectors of the big three)
 *  - GitHub      : official REST API (structured JSON)
 *  - Wikipedia   : official API (structured JSON)
 *  - Google      : skipped — bare-fetch HTML is JS-walled (enablejs). Needs a
 *                  real browser or an API key; see StealthBrowser option below.
 */

// Rotating realistic desktop Chrome UA pool (modern Chrome 121-133)
const UA_POOL = [
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
];

interface EngineResult {
  engine: string;
  items: SearxResult[];
}

// Simple in-memory cookie jar per host — engines reward consistent sessions.
const cookieJar = new Map<string, string>();

function stealthHeaders(extra?: Record<string, string>): Record<string, string> {
  const ua = UA_POOL[Math.floor(Math.random() * UA_POOL.length)];
  return {
    "User-Agent": ua,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="133", "Google Chrome";v="133"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Linux"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    Connection: "keep-alive",
    ...extra,
  };
}

function cookieHeaderFor(host: string): string {
  return cookieJar.get(host) || "";
}

function rememberCookies(host: string, res: Response): void {
  const setCookies = res.headers.getSetCookie?.() || [];
  if (setCookies.length === 0) return;
  const pairs: string[] = [];
  for (const c of setCookies) {
    const nameVal = c.split(";")[0];
    if (nameVal && !pairs.some((p) => p.startsWith(nameVal.split("=")[0]))) {
      pairs.push(nameVal);
    }
  }
  if (pairs.length > 0) cookieJar.set(host, pairs.join("; "));
}

async function stealthFetch(url: string, timeoutMs = 6000): Promise<Response | null> {
  try {
    const host = new URL(url).hostname;
    const headers = stealthHeaders();
    const cookies = cookieHeaderFor(host);
    if (cookies) headers["Cookie"] = cookies;
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs), redirect: "follow" });
    rememberCookies(host, res);
    return res;
  } catch {
    return null;
  }
}

export class NativeMetaSearch {
  public static async search(query: string, limit: number = 8): Promise<SearxResult[]> {
    const engines: Promise<EngineResult>[] = [
      this.searchBing(query),
      this.searchDuckDuckGoLite(query),
      this.searchBrave(query),
      this.searchGitHub(query),
      this.searchWikipedia(query),
      this.searchCratesIo(query),
      this.searchNpm(query),
    ];

    const settled = await Promise.allSettled(engines);

    const byUrl = new Map<string, { item: SearxResult; engines: Set<string> }>();

    for (const res of settled) {
      if (res.status !== "fulfilled") continue;
      for (const item of res.value.items) {
        if (!item.url) continue;
        const norm = normalizeUrl(item.url);
        if (!norm) continue;
        const entry = byUrl.get(norm);
        if (entry) {
          entry.engines.add(res.value.engine);
          if (item.content.length > entry.item.content.length) {
            entry.item.content = item.content;
          }
          entry.item.score = (entry.item.score || 0) + (item.score || 0);
        } else {
          byUrl.set(norm, { item: { ...item, url: norm }, engines: new Set([res.value.engine]) });
        }
      }
    }

    // Rank: multi-engine agreement dominates; then engine score; then dev-domain boost.
    const ranked = [...byUrl.values()]
      .map(({ item, engines }) => ({
        item,
        score: (item.score || 0) + engines.size * 0.5 + (DEV_DOMAIN_RE.test(item.url) ? 0.25 : 0),
      }))
      .sort((a, b) => b.score - a.score);

    return ranked.slice(0, limit).map(({ item }) => item);
  }

  // ------------------------------------------------------------------------
  // Crates.io API — Direct Rust Crate Registry Lookups
  // ------------------------------------------------------------------------
  private static async searchCratesIo(query: string): Promise<EngineResult> {
    const cleanQ = query.replace(/[^\w\-\_]/g, " ").trim().split(/\s+/)[0];
    if (!cleanQ || cleanQ.length < 2) return { engine: "crates.io", items: [] };

    try {
      const res = await fetch(`https://crates.io/api/v1/crates?q=${encodeURIComponent(cleanQ)}&per_page=3`, {
        headers: { "User-Agent": "docsGround/1.0 (dev search client)" },
        signal: AbortSignal.timeout(3500)
      });
      if (!res.ok) return { engine: "crates.io", items: [] };
      const data = await res.json() as any;
      const items: SearxResult[] = [];

      for (const c of (data.crates || [])) {
        items.push({
          title: `crate ${c.name} v${c.max_version} (crates.io)`,
          url: `https://docs.rs/${c.name}/latest/${c.name}/`,
          content: `${c.description || "Rust crate"} • Documentation on docs.rs • Downloads: ${c.downloads}`,
          engine: "crates.io",
          score: 1.2
        });
      }
      return { engine: "crates.io", items };
    } catch {
      return { engine: "crates.io", items: [] };
    }
  }

  // ------------------------------------------------------------------------
  // npm Registry API — Direct JS/TS Package Lookups
  // ------------------------------------------------------------------------
  private static async searchNpm(query: string): Promise<EngineResult> {
    const cleanQ = query.replace(/[^\w\-\_@\/]/g, " ").trim().split(/\s+/)[0];
    if (!cleanQ || cleanQ.length < 2) return { engine: "npm", items: [] };

    try {
      const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(cleanQ)}&size=3`, {
        headers: { "User-Agent": "docsGround/1.0" },
        signal: AbortSignal.timeout(3500)
      });
      if (!res.ok) return { engine: "npm", items: [] };
      const data = await res.json() as any;
      const items: SearxResult[] = [];

      for (const obj of (data.objects || [])) {
        const pkg = obj.package;
        if (!pkg) continue;
        items.push({
          title: `npm package ${pkg.name} v${pkg.version}`,
          url: pkg.links?.homepage || pkg.links?.repository || pkg.links?.npm || `https://www.npmjs.com/package/${pkg.name}`,
          content: `${pkg.description || "Node/TS package"} • npm: ${pkg.name} • Publisher: ${pkg.publisher?.username || "unknown"}`,
          engine: "npm",
          score: 1.1
        });
      }
      return { engine: "npm", items };
    } catch {
      return { engine: "npm", items: [] };
    }
  }

  // ------------------------------------------------------------------------
  // Bing — RSS endpoint (structured XML, extremely bot-lenient)
  // ------------------------------------------------------------------------
  private static async searchBing(query: string): Promise<EngineResult> {
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&format=rss&count=15&setlang=en`;
    const res = await stealthFetch(url);
    if (!res || !res.ok) return { engine: "bing", items: [] };
    const xml = await res.text();
    const items: SearxResult[] = [];

    const itemRe = /<item>([\s\S]*?)<\/item>/g;
    let m: RegExpExecArray | null;
    while ((m = itemRe.exec(xml)) !== null) {
      const block = m[1];
      const title = decodeXml(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "");
      const link = decodeXml(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "");
      const desc = decodeXml(block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "");
      if (link.startsWith("http")) {
        items.push({ title, url: link, content: stripHtml(desc).slice(0, 300), engine: "bing", score: 1.0 });
      }
    }
    return { engine: "bing", items };
  }

  // ------------------------------------------------------------------------
  // DuckDuckGo Lite — minimal HTML endpoint, low bot pressure
  // ------------------------------------------------------------------------
  private static async searchDuckDuckGoLite(query: string): Promise<EngineResult> {
    const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
    const res = await stealthFetch(url);
    if (!res || !res.ok) return { engine: "duckduckgo", items: [] };
    const html = await res.text();
    const { document } = parseHTML(html);
    const items: SearxResult[] = [];

    // Lite layout: alternating <a> (link) and <td class='result-snippet'> (snippet)
    const links = document.querySelectorAll("a.result-link, a[href^='//duckduckgo.com/l/?uddg='], td a");
    for (const a of links) {
      let rawHref = a.getAttribute("href") || "";
      if (rawHref.startsWith("//")) rawHref = "https:" + rawHref;
      if (rawHref.includes("uddg=")) {
        const mm = rawHref.match(/uddg=([^&]+)/);
        if (mm?.[1]) rawHref = decodeURIComponent(mm[1]);
      }
      if (!rawHref.startsWith("http")) continue;
      const title = a.textContent?.trim() || "";
      if (title.length < 6) continue;

      // find sibling snippet cell
      let snippet = "";
      let td = a.closest("td") || a.parentElement;
      const siblings = td?.parentElement?.children;
      if (siblings) {
        for (const s of siblings) {
          const t = s.textContent?.trim() || "";
          if (t && t !== title && t.length > title.length) {
            snippet = t.slice(0, 300);
            break;
          }
        }
      }
      items.push({ title, url: rawHref, content: snippet, engine: "duckduckgo", score: 1.0 });
    }
    return { engine: "duckduckgo", items };
  }

  // ------------------------------------------------------------------------
  // Brave — HTML blocks (solid selectors)
  // ------------------------------------------------------------------------
  private static async searchBrave(query: string): Promise<EngineResult> {
    const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}&source=web`;
    const res = await stealthFetch(url);
    if (!res || !res.ok) return { engine: "brave", items: [] };
    const html = await res.text();
    const { document } = parseHTML(html);
    const items: SearxResult[] = [];

    for (const el of document.querySelectorAll("[data-type='web']")) {
      const content = el.querySelector(".result-content");
      const linkEl = content?.querySelector("a[href]") || el.querySelector("a[href]");
      const href = linkEl?.getAttribute("href");
      if (!href || !href.startsWith("http")) continue;
      // Title: the heading-ish text inside the link, minus favicon noise
      const linkText = linkEl?.textContent?.trim() || "";
      const title = linkText.replace(/[ \t]+/g, " ").split("\n").filter(Boolean).slice(-2).join(" ").trim() || linkText.slice(0, 120);
      const snippetEl = el.querySelector(".snippet-description, .snippet-content, .description");
      items.push({
        title: title.slice(0, 200),
        url: href,
        content: snippetEl?.textContent?.trim() || "",
        engine: "brave",
        score: 0.95,
      });
    }
    return { engine: "brave", items };
  }

  // ------------------------------------------------------------------------
  // GitHub — official REST API
  // ------------------------------------------------------------------------
  private static async searchGitHub(query: string): Promise<EngineResult> {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`;
    const res = await stealthFetch(url, 6000);
    if (!res || !res.ok) return { engine: "github", items: [] };
    const data = (await res.json()) as {
      items?: { full_name: string; html_url: string; description: string; stargazers_count: number }[];
    };
    const items: SearxResult[] = (data.items || []).map((r) => ({
      title: r.full_name,
      url: r.html_url,
      content: (r.description || "") + ` — ${r.stargazers_count} stars`,
      engine: "github",
      score: 1.0,
    }));
    return { engine: "github", items };
  }

  // ------------------------------------------------------------------------
  // Wikipedia — official API
  // ------------------------------------------------------------------------
  private static async searchWikipedia(query: string): Promise<EngineResult> {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=8&format=json&origin=*`;
    const res = await stealthFetch(url, 6000);
    if (!res || !res.ok) return { engine: "wikipedia", items: [] };
    const data = (await res.json()) as { query?: { search?: { title: string; snippet: string }[] } };
    const items: SearxResult[] = (data.query?.search || []).map((r) => ({
      title: r.title,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, "_"))}`,
      content: stripHtml(r.snippet),
      engine: "wikipedia",
      score: 0.8,
    }));
    return { engine: "wikipedia", items };
  }

  /**
   * Full stealth browser mode for JS-walled engines (Google, Startpage).
   * Requires a headless browser; kept as a documented extension point so the
   * core stays dependency-free. Set DOCSGROUND_BROWSER=1 to enable later.
   */
  public static async searchGoogle(query: string): Promise<EngineResult> {
    if (process.env.DOCSGROUND_BROWSER === "1") {
      // Reserved for the StealthBrowser adapter — never bare-fetch Google HTML.
    }
    return { engine: "google", items: [] };
  }
}

// ---------------------------------------------------------------------------

function normalizeUrl(url: string): string | null {
  try {
    const u = new URL(url);
    u.hash = "";
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "fbclid", "gclid", "source"]) {
      u.searchParams.delete(key);
    }
    return u.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .trim();
}

const DEV_DOMAIN_RE =
  /docs\.|stackoverflow\.com|github\.com|developer\.|\.rs$|\.mdn\.|crates\.io|npmjs\.com|lib\.rs|sourcegraph\.com|rust-lang\.org|react\.dev|bun\.com|nodejs\.org|typescriptlang\.org/;
