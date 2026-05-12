#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("\n🎙️  Voon Setup Script\n");

// Check .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local tidak ditemukan!");
  console.error("   Salin .env.local.example → .env.local dan isi semua nilai.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const requiredVars = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "LIVEKIT_API_KEY",
  "LIVEKIT_API_SECRET",
  "NEXT_PUBLIC_LIVEKIT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "DATABASE_URL",
  "ANTHROPIC_API_KEY",
];

const missing = requiredVars.filter((v) => !envContent.includes(`${v}=`) || envContent.includes(`${v}=xxxx`));
if (missing.length > 0) {
  console.error("❌ Environment variable belum diisi:");
  missing.forEach((v) => console.error(`   - ${v}`));
  process.exit(1);
}

console.log("✅ Environment variables OK");

// Generate Prisma client
console.log("\n📦 Generating Prisma client...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("✅ Prisma client generated");
} catch {
  console.error("❌ Gagal generate Prisma client");
}

// Run migrations
console.log("\n🗃️  Running database migrations...");
try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("✅ Database migrations OK");
} catch {
  console.log("⚠️  Migration gagal (mungkin perlu: npx prisma migrate dev --name init)");
}

console.log("\n🎉 Setup selesai!\n");
console.log("Langkah selanjutnya:");
console.log("  1. npm run dev");
console.log("  2. Buka http://localhost:3000");
console.log("  3. Tambahkan webhook Clerk: /api/webhooks/clerk");
console.log("  4. Tambahkan webhook LiveKit: /api/webhooks/livekit");
console.log("\n");
