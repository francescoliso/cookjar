import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_TIMEOUT_MS = 12_000;

export function applyCors(req: VercelRequest, res: VercelResponse): void {
  const allowed = (process.env.ALLOWED_ORIGINS ?? '*').split(',').map((s) => s.trim());
  const origin = (req.headers.origin as string) ?? '';
  if (allowed.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function sendError(res: VercelResponse, status: number, message: string): void {
  res.status(status).json({ error: message });
}

// AbortSignal that fires after `ms`. (AbortSignal.timeout isn't available on all
// Node runtimes we target, so build it explicitly.)
export function timeoutSignal(ms: number = DEFAULT_TIMEOUT_MS): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

// Run `fn`, retrying once on failure (covers transient upstream hiccups).
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    return await fn();
  }
}

// Very small fixed-window per-IP limiter (per warm instance). Returns true if
// the request is allowed.
const hits = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(req: VercelRequest, limit = 30, windowMs = 60_000): boolean {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.socket?.remoteAddress ?? 'unknown');
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

export function getQueryParam(req: VercelRequest, name: string): string | undefined {
  const v = req.query[name];
  return Array.isArray(v) ? v[0] : v;
}
