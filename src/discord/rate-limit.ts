export class UserRateLimiter {
  private readonly buckets = new Map<string, number[]>();

  constructor(private readonly maxRequests = 12, private readonly windowMs = 60_000) {
    if (!Number.isInteger(maxRequests) || maxRequests < 1) throw new Error('maxRequests harus integer >= 1.');
    if (!Number.isInteger(windowMs) || windowMs < 1_000) throw new Error('windowMs harus integer >= 1000.');
  }

  consume(userId: string, now = Date.now(), scope = 'default'): boolean {
    const key = `${scope}:${userId}`;
    const cutoff = now - this.windowMs;
    const timestamps = (this.buckets.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
    if (timestamps.length >= this.maxRequests) {
      this.buckets.set(key, timestamps);
      return false;
    }
    timestamps.push(now);
    this.buckets.set(key, timestamps);
    if (this.buckets.size > 10_000) this.cleanup(now);
    return true;
  }

  private cleanup(now: number): void {
    const cutoff = now - this.windowMs;
    for (const [key, timestamps] of this.buckets) {
      const active = timestamps.filter((timestamp) => timestamp > cutoff);
      if (active.length) this.buckets.set(key, active);
      else this.buckets.delete(key);
    }
  }
}
