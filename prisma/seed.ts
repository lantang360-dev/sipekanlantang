import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const saltRounds = 10;
  const adminHash = await bcrypt.hash('admin123', saltRounds);
  const petugasHash = await bcrypt.hash('petugas123', saltRounds);

  // Seed officers
  console.log('  Creating officers...');
  await prisma.officer.upsert({
    where: { username: 'admin' },
    update: { password: adminHash },
    create: { username: 'admin', password: adminHash, name: 'Administrator', role: 'admin' },
  });
  await prisma.officer.upsert({
    where: { username: 'petugas1' },
    update: { password: petugasHash },
    create: { username: 'petugas1', password: petugasHash, name: 'Petugas Loket 1', role: 'petugas' },
  });
  await prisma.officer.upsert({
    where: { username: 'petugas2' },
    update: { password: petugasHash },
    create: { username: 'petugas2', password: petugasHash, name: 'Petugas Loket 2', role: 'petugas' },
  });

  // Seed services
  console.log('  Creating services...');
  const s1 = await prisma.service.upsert({
    where: { prefix: 'B' },
    update: {},
    create: { name: 'Besukan Tatap Muka', prefix: 'B', description: 'Layanan kunjungan tatap muka dengan warga binaan', estimatedMin: 30, order: 1 },
  });
  const s2 = await prisma.service.upsert({
    where: { prefix: 'P' },
    update: {},
    create: { name: 'Penitipan Barang', prefix: 'P', description: 'Layanan penitipan barang untuk warga binaan', estimatedMin: 15, order: 2 },
  });
  // Seed counters
  console.log('  Creating counters...');
  const existingCounters = await prisma.counter.count();
  if (existingCounters === 0) {
    await prisma.counter.createMany({
      data: [
        { name: 'Loket 1', serviceId: s1.id, status: 'aktif', currentNum: '', order: 1 },
        { name: 'Loket 2', serviceId: s1.id, status: 'aktif', currentNum: '', order: 2 },
        { name: 'Loket 3', serviceId: s2.id, status: 'aktif', currentNum: '', order: 3 },
      ],
    });
  }

  // Seed settings
  console.log('  Creating settings...');
  const settings = [
    { key: 'open_hour', value: '08:00' },
    { key: 'close_hour', value: '15:00' },
    { key: 'max_visitors', value: '3' },
    { key: 'visit_days', value: 'Senin,Jumat' },
    { key: 'institution_name', value: 'Lapas Kelas IIA Bontang' },
    { key: 'marquee_text', value: 'Selamat datang di Pelayanan Besukan Lapas Kelas IIA Bontang. Pastikan Anda membawa KTP asli yang masih berlaku. Maksimal 3 orang pengunjung per warga binaan.' },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log('✅ Seed selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
