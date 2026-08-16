import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  emDelimiter: "*"
});

// Remove unnecessary elements before conversion
turndown.remove(["script", "style", "nav", "footer", "iframe", "noscript"]);

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
    const symbolRegex = /(?:class|interface|type|enum|function|fn|pub fn|struct|def)\s+([A-Za-z0-9_]+)/g;
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

  public static parseHTML(html: string, url?: string): ParsedDoc {
    // If raw markdown is passed directly
    if (!html.includes("<html") && !html.includes("<!DOCTYPE") && !html.includes("<body")) {
      return this.parseMarkdown(html, url || "Document");
    }

    try {
      const { document } = parseHTML(html);

      // Remove noise elements
      const removeSelectors = ["script", "style", "nav", "footer", ".ad", ".cookie-banner", "header", "svg"];
      for (const sel of removeSelectors) {
        document.querySelectorAll(sel).forEach(el => el.remove());
      }

      // Safe Readability extraction
      const reader = new Readability(document as any, { charThreshold: 20 });
      const article = reader.parse();

      if (article && article.content) {
        const markdown = turndown.turndown(article.content);
        return this.parseMarkdown(markdown, article.title || "Untitled Document");
      }

      const bodyHtml = document.body ? document.body.innerHTML : html;
      const markdown = turndown.turndown(bodyHtml);
      return this.parseMarkdown(markdown, document.title || "Untitled Document");
    } catch {
      // Fallback to plain turndown if Readability fails
      return this.parseMarkdown(html, url || "Document");
    }
  }
}
