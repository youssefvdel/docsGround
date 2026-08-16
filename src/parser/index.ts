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

export interface ParsedDoc {
  title: string;
  markdown: string;
  headings: string[];
  symbols: string[];
}

export class DocParser {
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

    // Extract code symbols / definitions
    const symbolRegex = /(?:class|interface|type|enum|function|fn|pub fn|struct|pub struct|trait|pub trait|impl|def)\s+([A-Za-z0-9_]+)/g;
    let match;
    while ((match = symbolRegex.exec(raw)) !== null) {
      if (match[1] && !symbols.includes(match[1])) {
        symbols.push(match[1]);
      }
    }

    const title = headings.length > 0 ? (headings[0] ?? fallbackTitle) : fallbackTitle;

    return {
      title,
      markdown: raw.trim(),
      headings,
      symbols
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
