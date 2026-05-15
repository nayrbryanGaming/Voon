import { NextRequest, NextResponse } from "next/server";

/**
 * Standard security headers applied to all API responses.
 * Prevents content-type sniffing, clickjacking, and leaks referrer info.
 */
export function secureHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-XSS-Protection": "1; mode=block",
    "Cache-Control": "no-store",
  };
}

/** Wrap a NextResponse with security headers. */
export function withSecureHeaders(res: NextResponse): NextResponse {
  const headers = secureHeaders();
  for (const [k, v] of Object.entries(headers)) {
    res.headers.set(k, v);
  }
  return res;
}

/** Return 400 if required JSON fields are missing or wrong type. */
export function requireFields(
  body: Record<string, unknown>,
  fields: Array<{ key: string; type: "string" | "number" | "boolean" }>
): string | null {
  for (const { key, type } of fields) {
    const val = body[key];
    if (val === undefined || val === null) return `${key} diperlukan`;
    if (typeof val !== type) return `${key} harus bertipe ${type}`;
    if (type === "string" && (val as string).trim() === "") return `${key} tidak boleh kosong`;
  }
  return null;
}

/** Simple in-memory rate limiter (per IP, resets hourly).
 *  Max map size is capped to avoid unbounded growth in long-running containers.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_MAP_MAX = 10_000;

function pruneRateMap(now: number) {
  if (rateLimitMap.size < RATE_MAP_MAX) return;
  for (const [key, entry] of rateLimitMap) {
    if (entry.resetAt < now) rateLimitMap.delete(key);
    if (rateLimitMap.size < RATE_MAP_MAX / 2) break;
  }
}

export function checkRateLimit(
  req: NextRequest,
  maxPerHour: number = 60
): NextResponse | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const now = Date.now();
  pruneRateMap(now);

  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return null;
  }

  entry.count++;
  if (entry.count > maxPerHour) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi dalam 1 jam." },
      {
        status: 429,
        headers: {
          ...secureHeaders(),
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
        },
      }
    );
  }

  return null;
}

/** Sanitize a string: trim + remove null bytes + limit length. */
export function sanitizeString(value: string, maxLength = 2000): string {
  return value.replace(/\0/g, "").trim().slice(0, maxLength);
}

/** Validate that a string is a valid CUID or UUID (DB ID format). */
const CUID_PATTERN = /^c[a-z0-9]{24,}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidId(value: string): boolean {
  return CUID_PATTERN.test(value) || UUID_PATTERN.test(value);
}
