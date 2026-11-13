// Seed kategori global (PRD §4.3). Jalankan dengan: npm run db:seed
// Aman dijalankan berulang kali: kategori yang sudah ada tidak diduplikasi.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

// Daftar usulan PRD §4.3. Ubah di sini bila tim menyepakati daftar lain.
const CATEGORY_NAMES = [
  'Fiction',
  'Science',
  'Technology',
  'History',
  'Education',
  'Other',
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    for (const name of CATEGORY_NAMES) {
      // upsert: buat bila belum ada, biarkan bila sudah ada (idempotent).
      await prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    const total = await prisma.category.count();
    console.log(
      `Seed selesai: ${CATEGORY_NAMES.length} kategori diproses, total ${total} kategori di database.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

await main();
