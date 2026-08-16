import { ConfigManager } from "./config.js";

export class EmbeddingEngine {
  private static localExtractor: any = null;

  public static async embed(text: string): Promise<Float32Array> {
    const config = ConfigManager.get().embedding;

    if (config.provider === "openai" && config.baseUrl) {
      try {
        const res = await fetch(`${config.baseUrl.replace(/\/+$/, "")}/embeddings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey || "dummy"}`
          },
          body: JSON.stringify({
            model: config.model || "text-embedding-3-small",
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
        // Fallback to local model
      }
    }

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
