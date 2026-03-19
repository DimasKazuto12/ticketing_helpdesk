const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Sedang mengisi kategori...");
  await prisma.category.upsert({ where: { id: 1 }, update: {}, create: { id: 1, categoryName: 'UI/UX Bug' } });
  await prisma.category.upsert({ where: { id: 2 }, update: {categoryName: 'Software'}, create: { id: 2, categoryName: 'Software' } });
  await prisma.category.upsert({ where: { id: 3 }, update: {categoryName: 'Hardware'}, create: { id: 3, categoryName: 'Hardware' } });
  await prisma.category.upsert({ where: { id: 4 }, update: {}, create: { id: 4, categoryName: 'Other' } });
  console.log("✅ Berhasil masukin kategori!");

  console.log("Menanam data Admin...");
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      password: 'admin123', // Nanti kalau mau serius harus di-hash pakai bcrypt ya!
      name: 'Super Admin',
      role: 'admin' // Pastikan di schema.prisma kamu ada role ADMIN
    },
  });
  console.log("✅ Admin siap digunakan!");
}

main().catch(console.error).finally(() => prisma.$disconnect());