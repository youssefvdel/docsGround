export class EmbeddingEngine {
  private static localExtractor: any = null;

  /**
   * Generates high-quality 384-dimensional dense semantic vector embeddings
   * running 100% locally via Xenova quantized ONNX BGE-Small (zero API calls, private).
   */
  public static async embed(text: string): Promise<Float32Array> {
    return this.embedLocal(text);
  }

  private static async embedLocal(text: string): Promise<Float32Array> {
    if (!this.localExtractor) {
      const { pipeline, env } = await import("@xenova/transformers");
      env.allowLocalModels = false;
      env.useBrowserCache = false;
      if (env.backends?.onnx?.wasm) {
        env.backends.onnx.wasm.numThreads = 1;
        env.backends.onnx.wasm.proxy = false;
      }
      this.localExtractor = await pipeline("feature-extraction", "Xenova/bge-small-en-v1.5", {
        quantized: true
      });
    }
    const output = await this.localExtractor(text.slice(0, 1000), {
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
