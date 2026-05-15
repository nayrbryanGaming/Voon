/**
 * Safe DB schema sync for Vercel builds.
 * Runs prisma db push --skip-generate --accept-data-loss.
 * Non-fatal: if DB is unreachable during build, the build continues anyway.
 * The migration SQL at prisma/migrations/20260515_add_recording_subscription/migration.sql
 * can also be run manually via Supabase SQL Editor.
 */
const { execSync } = require("child_process");

if (!process.env.DATABASE_URL) {
  console.log("⚠  DATABASE_URL not set — skipping db push (run migration manually).");
  process.exit(0);
}

console.log("→ Syncing DB schema...");
try {
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    timeout: 60_000,
  });
  console.log("✓ DB schema synced.");
} catch (err) {
  console.warn("⚠  DB push failed (non-fatal):", err.message);
  console.warn("   Run the SQL in prisma/migrations/20260515_add_recording_subscription/migration.sql manually.");
}
