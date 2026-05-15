import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY ?? "";
  if (hex.length === 64) {
    return Buffer.from(hex, "hex");
  }
  // Derive from NEXTAUTH_SECRET when ENCRYPTION_KEY is not set.
  // NEXTAUTH_SECRET must be present (Next-Auth requires it at startup anyway).
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "Set ENCRYPTION_KEY (64-char hex) or NEXTAUTH_SECRET in your environment. " +
      "See .env.local.example."
    );
  }
  // Pad/truncate to 32 bytes — deterministic per deployment
  const buf = Buffer.alloc(32, 0);
  Buffer.from(secret).copy(buf, 0, 0, Math.min(32, secret.length));
  return buf;
}

/** Encrypt a plaintext string. Returns base64-encoded iv+tag+ciphertext. */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Layout: iv(12) | tag(16) | ciphertext
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

/** Decrypt a base64-encoded ciphertext. Returns plaintext or "" on error. */
export function decrypt(ciphertext: string): string {
  try {
    const key = getKey();
    const buf = Buffer.from(ciphertext, "base64");
    if (buf.length < 28) return "";
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

/** Mask a token for display — shows first 8 chars then asterisks. */
export function maskToken(token: string): string {
  if (token.length <= 12) return "••••••••";
  return token.slice(0, 8) + "••••••••" + token.slice(-4);
}
