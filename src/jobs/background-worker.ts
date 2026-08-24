import { log } from '../observability/logger.js';

export type WorkerTask = () => Promise<void>;

export type BackgroundWorkerOptions = {
  name: string;
  intervalMs: number;
  task: WorkerTask;
};

/**
 * Runs deterministic maintenance outside Discord interaction handlers.
 * The single-flight guard prevents overlapping ticks when a database operation
 * takes longer than the configured interval.
 */
export class BackgroundWorker {
  private timer?: NodeJS.Timeout;
  private running = false;
  private stopped = true;

  constructor(private readonly options: BackgroundWorkerOptions) {
    if (!Number.isFinite(options.intervalMs) || options.intervalMs < 1_000) {
      throw new Error(`Invalid interval for worker ${options.name}`);
    }
  }

  async runOnce(): Promise<boolean> {
    if (this.running || this.stopped) return false;
    this.running = true;
    try {
      await this.options.task();
      return true;
    } catch (error) {
      log('error', 'background_worker_failed', { worker: this.options.name, error });
      return false;
    } finally {
      this.running = false;
    }
  }

  start(): void {
    if (!this.stopped) return;
    this.stopped = false;
    this.timer = setInterval(() => void this.runOnce(), this.options.intervalMs);
    void this.runOnce();
    log('info', 'background_worker_started', { worker: this.options.name, intervalMs: this.options.intervalMs });
  }

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    log('info', 'background_worker_stopped', { worker: this.options.name });
  }
}

export function createMaintenanceWorker(task: WorkerTask, intervalMs = 15 * 60_000): BackgroundWorker {
  return new BackgroundWorker({ name: 'maintenance', intervalMs, task });
}
