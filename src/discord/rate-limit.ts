export class UserRateLimiter {
  private readonly buckets = new Map<string, number[]>();

  constructor(private readonly maxRequests = 12, private readonly windowMs = 60_000) {}

  consume(userId: string, now = Date.now()): boolean {
    const cutoff = now - this.windowMs;
    const timestamps = (this.buckets.get(userId) ?? []).filter((timestamp) => timestamp > cutoff);
    if (timestamps.length >= this.maxRequests) {
      this.buckets.set(userId, timestamps);
      return false;
    }
    timestamps.push(now);
    this.buckets.set(userId, timestamps);
    if (this.buckets.size > 10_000) this.cleanup(now);
    return true;
  }

  private cleanup(now: number): void {
    const cutoff = now - this.windowMs;
    for (const [userId, timestamps] of this.buckets) {
      const active = timestamps.filter((timestamp) => timestamp > cutoff);
      if (active.length) this.buckets.set(userId, active);
      else this.buckets.delete(userId);
    }
  }
}
