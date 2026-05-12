/**
 * Tek süreç içi basit hız sınırlayıcı (brute-force azaltır).
 * Birden fazla sunucu örneği için Redis vb. gerekir.
 */
type Bucket = { resetAt: number; count: number };

const buckets = new Map<string, Bucket>();

function pruneIfHuge() {
  if (buckets.size > 20_000) {
    buckets.clear();
  }
}

/** İzin verilirse true; limit aşıldıysa false. */
export function allowRateLimit(key: string, max: number, windowMs: number): boolean {
  pruneIfHuge();
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now > b.resetAt) {
    b = { resetAt: now + windowMs, count: 0 };
    buckets.set(key, b);
  }
  if (b.count >= max) return false;
  b.count += 1;
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  return "0.0.0.0";
}
