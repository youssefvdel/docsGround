import { pipeline } from "@xenova/transformers";

export class EmbeddingEngine {
  private static extractor: any = null;
  private static modelName = "Xenova/bge-small-en-v1.5";

  public static async init(): Promise<void> {
    if (!this.extractor) {
      this.extractor = await pipeline("feature-extraction", this.modelName, {
        quantized: true,
      });
    }
  }

  public static async embed(text: string): Promise<Float32Array> {
    await this.init();
    const output = await this.extractor(text, {
      pooling: "mean",
      normalize: true,
    });
    return new Float32Array(output.data);
  }

  public static cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dot = 0;
    for (let i = 0; i < a.length; i++) {
      dot += (a[i] ?? 0) * (b[i] ?? 0);
    }
    return dot;
  }
}
