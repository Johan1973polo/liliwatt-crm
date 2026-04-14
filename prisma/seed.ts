import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { encryptPassword } from '../lib/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Nettoyer la base de données
  await prisma.notification.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.message.deleteMany();
  await prisma.request.deleteMany();
  await prisma.link.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.user.deleteMany();

  // Créer les utilisateurs
  const adminPasswordHash = await bcrypt.hash('LILIWATT2023@', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'sabir.bahloul@liliwatt.fr',
      phone: null,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin créé:', admin.email);

  const referentPasswordHash = await bcrypt.hash('azertyazerty', 10);
  const referent = await prisma.user.create({
    data: {
      email: 'kevin.moreau@liliwatt.fr',
      phone: '07 83 10 11 29',
      passwordHash: referentPasswordHash,
      role: 'REFERENT',
      isActive: true,
    },
  });
  console.log('✅ Référent créé:', referent.email);

  const vendeurPasswordHash = await bcrypt.hash('Vendeur123!', 10);
  const vendeur = await prisma.user.create({
    data: {
      email: 'johan.mallet@liliwatt.fr',
      phone: '+33 6 12 34 56 78',
      passwordHash: vendeurPasswordHash,
      role: 'VENDEUR',
      referentId: referent.id,
      isActive: true,
    },
  });
  console.log('✅ Vendeur créé:', vendeur.email);

  // Créer le lien global LILIWATT FACTURATION
  await prisma.link.create({
    data: {
      scope: 'GLOBAL',
      title: 'LILIWATT FACTURATION',
      url: 'https://dashing-croissant-127a00.netlify.app/',
      order: 1,
    },
  });
  console.log('✅ Lien global créé');

  // Créer des identifiants pour le vendeur
  await prisma.credential.createMany({
    data: [
      {
        userId: vendeur.id,
        serviceName: 'OHM Énergie',
        login: 'vendeur.liliwatt',
        passwordEncrypted: encryptPassword('Ohm2024!'),
      },
      {
        userId: vendeur.id,
        serviceName: 'Gmail Pro',
        login: 'vendeur@liliwatt.fr',
        passwordEncrypted: encryptPassword('Gmail@Secure123'),
      },
      {
        userId: vendeur.id,
        serviceName: 'Espace Eni',
        login: 'vendeur_eni',
        passwordEncrypted: encryptPassword('Eni#Password99'),
      },
      {
        userId: vendeur.id,
        serviceName: 'Ekwateur',
        login: 'v.liliwatt',
        passwordEncrypted: encryptPassword('EN ATTENTE'),
      },
      {
        userId: vendeur.id,
        serviceName: 'TotalEnergies',
        login: 'vendeur.total',
        passwordEncrypted: encryptPassword('Total2024Pro!'),
      },
    ],
  });
  console.log('✅ Identifiants créés');

  // Créer quelques disponibilités
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.availability.createMany({
    data: [
      {
        userId: vendeur.id,
        date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        slotsJson: JSON.stringify({ morning: true, afternoon: true, evening: false }),
      },
      {
        userId: vendeur.id,
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        slotsJson: JSON.stringify({ morning: true, afternoon: false, evening: true }),
      },
      {
        userId: vendeur.id,
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        slotsJson: JSON.stringify({ morning: false, afternoon: true, evening: true }),
      },
    ],
  });
  console.log('✅ Disponibilités créées');

  // Créer une demande exemple
  const request = await prisma.request.create({
    data: {
      type: 'DATA_BASE',
      userId: vendeur.id,
      referentId: referent.id,
      status: 'NEW',
      payloadJson: JSON.stringify({
        description: 'Besoin de la base télépro de la région Île-de-France',
      }),
    },
  });
  console.log('✅ Demande créée');

  // Créer les notifications associées
  await prisma.notification.createMany({
    data: [
      {
        userId: referent.id,
        kind: 'REQUEST',
        entityId: request.id,
        isRead: false,
      },
      {
        userId: admin.id,
        kind: 'REQUEST',
        entityId: request.id,
        isRead: false,
      },
    ],
  });
  console.log('✅ Notifications créées');

  console.log('');
  console.log('✨ Seeding terminé avec succès !');
  console.log('');
  console.log('📧 Comptes créés :');
  console.log('   Admin    : sabir.bahloul@liliwatt.fr / LILIWATT2023@');
  console.log('   Référent : kevin.moreau@liliwatt.fr / azertyazerty (Tel: 07 83 10 11 29)');
  console.log('   Vendeur  : johan.mallet@liliwatt.fr / Vendeur123! (Rattaché à Kevin)');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
