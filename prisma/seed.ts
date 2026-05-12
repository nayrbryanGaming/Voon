import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CAMPUSES = [
  { name: "Universitas Indonesia", domain: "ui.ac.id" },
  { name: "Institut Teknologi Bandung", domain: "itb.ac.id" },
  { name: "Universitas Gadjah Mada", domain: "ugm.ac.id" },
  { name: "Institut Teknologi Sepuluh Nopember", domain: "its.ac.id" },
  { name: "Universitas Brawijaya", domain: "ub.ac.id" },
  { name: "Universitas Diponegoro", domain: "undip.ac.id" },
  { name: "Universitas Padjadjaran", domain: "unpad.ac.id" },
  { name: "Universitas Airlangga", domain: "unair.ac.id" },
  { name: "Universitas Hasanuddin", domain: "unhas.ac.id" },
  { name: "Universitas Sebelas Maret", domain: "uns.ac.id" },
  { name: "Universitas Pendidikan Indonesia", domain: "upi.edu" },
  { name: "Universitas Negeri Yogyakarta", domain: "uny.ac.id" },
  { name: "Universitas Sumatera Utara", domain: "usu.ac.id" },
  { name: "Universitas Lampung", domain: "unila.ac.id" },
  { name: "Universitas Sriwijaya", domain: "unsri.ac.id" },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const campus of CAMPUSES) {
    await prisma.campus.upsert({
      where: { domain: campus.domain },
      update: { name: campus.name },
      create: campus,
    });
    console.log(`  ✓ ${campus.name}`);
  }

  console.log(`\n✅ Seeded ${CAMPUSES.length} campuses`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
