import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  emDelimiter: "*"
});

// Configure custom turndown rules for Rust docs & technical documentation
turndown.addRule("rustDocHeaders", {
  filter: ["h1", "h2", "h3", "h4"],
  replacement: function (content, node: any) {
    const level = node.nodeName.charAt(1);
    const prefix = "#".repeat(Number(level));
    // Clean up Rustdoc internal section anchors like [§](#trait-implementations)
    const cleanContent = content.replace(/\[§\]\(#[^\)]*\)/g, "").trim();
    return `\n\n${prefix} ${cleanContent}\n\n`;
  }
});

turndown.addRule("rustDocDetails", {
  filter: ["details"],
  replacement: function (content) {
    return `\n\n${content}\n\n`;
  }
});

turndown.remove(["script", "style", "iframe", "noscript"]);

export interface DocChunk {
  id: string;
  title: string;
  heading: string;
  content: string;
  symbols: string[];
}

export interface ParsedDoc {
  title: string;
  markdown: string;
  headings: string[];
  symbols: string[];
  chunks: DocChunk[];
}

/**
 * Unified regex for extracting rich typed code signatures across languages.
 * Matches: Rust (fn, struct, enum, trait, impl), TS/JS (interface, type, class, enum,
 * const, let, var, function, async function, import), Python (def, class),
 * Go (func, type, struct, interface), C (struct, enum, union, typedef),
 * and common declarations.
 *
 * Captures language keyword + name + optional generics/tail for filtering.
 */
const SYMBOL_REGEX = /(?:^|\n|\s)(?:\b(async\s+)?function\b|\b(const|let|var|import|export|default|type|interface|enum|class|struct|union|trait|impl|fn|def|func|typedef)\b)\s+([A-Za-z_$][\w$]*)/g;

export class DocParser {
  /**
   * Split long markdown document into coherent heading-aware chunks with parent metadata
   */
  public static chunkMarkdown(raw: string, baseTitle: string, maxTokens: number = 400): DocChunk[] {
    const lines = raw.split("\n");
    const chunks: DocChunk[] = [];
    
    let currentHeading = baseTitle;
    let currentLines: string[] = [];
    let chunkIndex = 0;

    const flushChunk = () => {
      const text = currentLines.join("\n").trim();
      if (text.length > 20) {
        const symbols: string[] = [];
        const symSet = new Set<string>();
        let symMatch;
        SYMBOL_REGEX.lastIndex = 0;
        while ((symMatch = SYMBOL_REGEX.exec(text)) !== null) {
          const name = symMatch[3];
          if (name && !symSet.has(name)) {
            symSet.add(name);
            symbols.push(name);
          }
        }

        chunks.push({
          id: `chunk_${chunkIndex++}`,
          title: baseTitle,
          heading: currentHeading,
          content: `${baseTitle} > ${currentHeading}\n\n${text}`,
          symbols
        });
      }
      currentLines = [];
    };

    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch && headingMatch[2]) {
        if (currentLines.length > 0) {
          flushChunk();
        }
        currentHeading = headingMatch[2].trim();
      } else {
        currentLines.push(line);
        // If section exceeds ~300 words without a heading, flush a split chunk
        if (currentLines.length > 50) {
          flushChunk();
        }
      }
    }

    if (currentLines.length > 0) {
      flushChunk();
    }

    // If doc was very short and produced no chunks, create at least one
    if (chunks.length === 0 && raw.trim().length > 0) {
      chunks.push({
        id: "chunk_0",
        title: baseTitle,
        heading: baseTitle,
        content: raw.trim(),
        symbols: []
      });
    }

    return chunks;
  }

  public static parseMarkdown(raw: string, fallbackTitle: string = "Untitled"): ParsedDoc {
    const headings: string[] = [];
    const symbols: string[] = [];

    // Extract headings
    const headingMatches = raw.match(/^#{1,6}\s+(.+)$/gm);
    if (headingMatches) {
      for (const h of headingMatches) {
        headings.push(h.replace(/^#{1,6}\s+/, "").trim());
      }
    }

    // Extract code symbols / definitions — unified, no dupes
    const symSet = new Set<string>();
    let match;
    SYMBOL_REGEX.lastIndex = 0;
    while ((match = SYMBOL_REGEX.exec(raw)) !== null) {
      const name = match[3];
      if (name && !symSet.has(name)) {
        symSet.add(name);
        symbols.push(name);
      }
    }

    const title = headings.length > 0 ? (headings[0] ?? fallbackTitle) : fallbackTitle;
    const chunks = this.chunkMarkdown(raw, title);

    return {
      title,
      markdown: raw.trim(),
      headings,
      symbols,
      chunks
    };
  }

  /**
   * High-Fidelity HTML to Markdown Parser
   * Specially tuned for docs.rs, GitHub, and technical documentation suites
   */
  public static parseHTML(html: string, url?: string): ParsedDoc {
    if (!html.includes("<html") && !html.includes("<!DOCTYPE") && !html.includes("<body")) {
      return this.parseMarkdown(html, url || "Document");
    }

    try {
      const { document } = parseHTML(html);

      // Clean unwanted UI chrome while keeping doc content
      const removeSelectors = [
        "script", "style", "nav", "footer", ".ad", ".cookie-banner", "header.rustdoc",
        "#sidebar-vars", ".sub-container", ".search-results"
      ];
      for (const sel of removeSelectors) {
        document.querySelectorAll(sel).forEach(el => el.remove());
      }

      // 1. Check for docs.rs / rustdoc main content container
      const rustdocMain = document.querySelector("#main-content, section#main-content, .content, article, main");
      
      if (rustdocMain) {
        const markdown = turndown.turndown(rustdocMain.innerHTML);
        const titleEl = document.querySelector("h1, .main-heading h1");
        const docTitle = titleEl ? titleEl.textContent?.replace(/\s+/g, " ").trim() : "Documentation";
        
        return this.parseMarkdown(markdown, docTitle || "Documentation");
      }

      // 2. Fallback to Mozilla Readability for article/blog style documentation
      try {
        const reader = new Readability(document as any, { charThreshold: 20 });
        const article = reader.parse();
        if (article && article.content && article.content.length > 200) {
          const markdown = turndown.turndown(article.content);
          return this.parseMarkdown(markdown, article.title || "Untitled Document");
        }
      } catch {}

      // 3. Fallback to full body turndown
      const bodyHtml = document.body ? document.body.innerHTML : html;
      const markdown = turndown.turndown(bodyHtml);
      return this.parseMarkdown(markdown, document.title || "Untitled Document");
    } catch {
      return this.parseMarkdown(html, url || "Document");
    }
  }
}