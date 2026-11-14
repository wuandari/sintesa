// Pembatas percobaan sederhana (di memori). Cukup untuk menghambat tebak-tebak password.
const buckets = new Map();

export function allow(key, limit = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    }
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

export function clientIp(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}
