const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el proceso de seed...');

  // Limpiar la base de datos (opcional, útil para desarrollo)
  await prisma.applianceHistory.deleteMany();
  await prisma.currentLog.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.appliance.deleteMany();
  await prisma.user.deleteMany();

  // 1. Crear el usuario Ale Zambrano
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('123456', salt);

  const ale = await prisma.user.create({
    data: {
      email: 'ale.zambrano@wattia.com',
      name: 'Ale Zambrano',
      passwordHash: passwordHash,
    },
  });
  console.log(`Usuario creado: ${ale.email} (pass: 123456)`);

  // 2. Crear electrodomésticos para Ale
  const appliancesData = [
    { name: 'Refrigerador LG', type: 'refrigerador', watts: 150, hoursUse: 24, status: 'ok' },
    { name: 'Aire Acondicionado Sala', type: 'aire', watts: 1200, hoursUse: 8, status: 'danger' }, // Simulamos un posible daño
    { name: 'TV Samsung 55"', type: 'television', watts: 95, hoursUse: 4, status: 'ok' },
    { name: 'Laptop Trabajo', type: 'laptop', watts: 65, hoursUse: 10, status: 'ok' },
  ];

  for (const app of appliancesData) {
    const appliance = await prisma.appliance.create({
      data: {
        userId: ale.id,
        name: app.name,
        type: app.type,
        watts: app.watts,
        hoursUse: app.hoursUse,
        status: app.status,
      },
    });

    // Crear historial para cada electrodoméstico
    const baseWatts = appliance.watts;
    for (let i = 0; i < 12; i++) {
      // Si el status es 'danger', hacemos que el último registro sea un 30% más alto
      const isDangerSpike = appliance.status === 'danger' && i >= 10;
      const multiplier = isDangerSpike ? 1.3 : (0.85 + Math.random() * 0.3);
      
      await prisma.applianceHistory.create({
        data: {
          applianceId: appliance.id,
          watts: Math.max(0, Math.round(baseWatts * multiplier)),
          recordedAt: new Date(Date.now() - (11 - i) * 10000)
        }
      });
    }
  }
  console.log('Electrodomésticos creados.');

  // 3. Crear algunas planillas de ejemplo
  const billsData = [
    { month: 'Mayo 2026', amount: 28.50, kwh: 235, status: 'pagada', dueDate: new Date('2026-06-15') },
    { month: 'Junio 2026', amount: 32.10, kwh: 260, status: 'pendiente', dueDate: new Date('2026-07-15') },
  ];

  for (const b of billsData) {
    await prisma.bill.create({
      data: {
        userId: ale.id,
        month: b.month,
        amount: b.amount,
        kwh: b.kwh,
        status: b.status,
        dueDate: b.dueDate,
      }
    });
  }
  console.log('Planillas creadas.');

  console.log('Seed completado satisfactoriamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
