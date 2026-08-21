export class UserCommandQueue {
  private readonly tails = new Map<string, Promise<void>>();

  async run(userId: string, task: () => Promise<void>): Promise<void> {
    const previous = this.tails.get(userId) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(task);
    this.tails.set(userId, next);
    try {
      await next;
    } finally {
      if (this.tails.get(userId) === next) this.tails.delete(userId);
    }
  }

  get size(): number {
    return this.tails.size;
  }
}
