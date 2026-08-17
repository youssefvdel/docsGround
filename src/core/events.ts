export interface DocIndexedEvent {
  library: string;
  docId: string;
  title: string;
  path: string;
  symbols: string[];
  timestamp: number;
}

export interface SearchFiredEvent {
  query: string;
  library?: string;
  matchedDocIds: string[];
  source: string;
  timestamp: number;
}

export type DocsGroundEvent = 
  | { type: "doc_indexed"; data: DocIndexedEvent }
  | { type: "search_fired"; data: SearchFiredEvent };

export class EventBus {
  private static subscribers = new Set<(event: DocsGroundEvent) => void>();
  private static recentSearches: SearchFiredEvent[] = [];

  public static subscribe(cb: (event: DocsGroundEvent) => void): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  public static emit(event: DocsGroundEvent): void {
    if (event.type === "search_fired") {
      this.recentSearches.unshift(event.data);
      if (this.recentSearches.length > 20) this.recentSearches.pop();
    }
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch {}
    }
  }

  public static emitDocIndexed(data: Omit<DocIndexedEvent, "timestamp">): void {
    this.emit({
      type: "doc_indexed",
      data: { ...data, timestamp: Date.now() }
    });
  }

  public static emitSearchFired(data: Omit<SearchFiredEvent, "timestamp">): void {
    this.emit({
      type: "search_fired",
      data: { ...data, timestamp: Date.now() }
    });
  }

  public static getRecentSearches(): SearchFiredEvent[] {
    return this.recentSearches;
  }
}
