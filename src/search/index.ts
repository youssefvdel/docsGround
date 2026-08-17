import { NativeMetaSearch } from "./native.js";

export interface SearchResultItem {
  title: string;
  url: string;
  content: string;
  engine: string;
  score?: number;
}

export type SearxResult = SearchResultItem;

export class MetaSearchClient {
  /**
   * 100% Native Multi-Engine Search (Bing, DDG Lite, Brave, GitHub, Wikipedia).
   * Fast, private, zero-dependency.
   */
  public async search(query: string, limit: number = 8): Promise<SearchResultItem[]> {
    return NativeMetaSearch.search(query, limit);
  }
}

export const SearxClient = MetaSearchClient;
export { NativeMetaSearch };
