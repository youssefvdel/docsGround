export interface IngestionJob {
  id: string;
  library: string;
  target: string;
  status: "running" | "completed" | "failed";
  progress: number; // 0 to 100
  totalFiles: number;
  processedFiles: number;
  currentFile?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export class JobManager {
  private static jobs = new Map<string, IngestionJob>();

  public static createJob(library: string, target: string): IngestionJob {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const job: IngestionJob = {
      id,
      library,
      target,
      status: "running",
      progress: 0,
      totalFiles: 0,
      processedFiles: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.jobs.set(id, job);
    return job;
  }

  public static getJob(id: string): IngestionJob | null {
    return this.jobs.get(id) || null;
  }

  public static getActiveJobs(): IngestionJob[] {
    return Array.from(this.jobs.values()).filter(j => j.status === "running");
  }

  public static getAllJobs(): IngestionJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  public static updateProgress(
    id: string,
    processed: number,
    total: number,
    currentFile?: string
  ): void {
    const job = this.jobs.get(id);
    if (!job) return;

    job.processedFiles = processed;
    job.totalFiles = total;
    job.progress = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;
    job.currentFile = currentFile;
    job.updatedAt = Date.now();
  }

  public static completeJob(id: string, totalIndexed: number): void {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = "completed";
    job.progress = 100;
    job.processedFiles = totalIndexed;
    job.totalFiles = totalIndexed;
    job.updatedAt = Date.now();
  }

  public static failJob(id: string, error: string): void {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = "failed";
    job.error = error;
    job.updatedAt = Date.now();
  }
}
