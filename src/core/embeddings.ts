export interface EmbeddingConfig {
  provider: "openai" | "local";
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}

export class EmbeddingEngine {
  private static config: EmbeddingConfig = {
    provider: (process.env.EMBEDDING_BASE_URL || process.env.OPENAI_BASE_URL) ? "openai" : "local",
    baseUrl: (process.env.EMBEDDING_BASE_URL || process.env.OPENAI_BASE_URL || "http://127.0.0.1:20128/v1").replace(/\/+$/, ""),
    apiKey: process.env.EMBEDDING_API_KEY || process.env.OPENAI_API_KEY || "dummy",
    model: process.env.EMBEDDING_MODEL || "text-embedding-3-small"
  };

  private static localExtractor: any = null;

  public static configure(cfg: Partial<EmbeddingConfig>) {
    this.config = { ...this.config, ...cfg };
  }

  public static async embed(text: string): Promise<Float32Array> {
    if (this.config.provider === "openai") {
      try {
        const res = await fetch(`${this.config.baseUrl}/embeddings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify({
            model: this.config.model,
            input: text.slice(0, 8000)
          }),
          signal: AbortSignal.timeout(8000)
        });

        if (res.ok) {
          const data = (await res.json()) as { data?: { embedding: number[] }[] };
          if (data.data && data.data[0] && data.data[0].embedding) {
            return new Float32Array(data.data[0].embedding);
          }
        }
      } catch {
        // Fallback to local model if remote fails
      }
    }

    // Local fallback via Xenova Transformers
    return this.embedLocal(text);
  }

  private static async embedLocal(text: string): Promise<Float32Array> {
    if (!this.localExtractor) {
      const { pipeline } = await import("@xenova/transformers");
      this.localExtractor = await pipeline("feature-extraction", "Xenova/bge-small-en-v1.5", {
        quantized: true
      });
    }
    const output = await this.localExtractor(text.slice(0, 2000), {
      pooling: "mean",
      normalize: true
    });
    return new Float32Array(output.data);
  }

  public static cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) return 0;
    let dot = 0;
    for (let i = 0; i < a.length; i++) {
      dot += (a[i] ?? 0) * (b[i] ?? 0);
    }
    return dot;
  }
}
