const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('👤 Vérification des utilisateurs...\n');

    const users = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'REFERENT'] }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    console.log('📋 Utilisateurs ADMIN et REFERENT:\n');
    users.forEach(user => {
      console.log(`- ${user.email}`);
      console.log(`  Prénom: ${user.firstName || 'NULL'}`);
      console.log(`  Nom: ${user.lastName || 'NULL'}`);
      console.log(`  Rôle: ${user.role}`);
      console.log('');
    });

    console.log('\n🔍 Vérification des déverrouillages...\n');

    const unlocks = await prisma.trainingProgress.findMany({
      where: {
        status: { in: ['UNLOCKED', 'IN_PROGRESS', 'COMPLETED'] },
        unlockedBy: { not: null }
      },
      include: {
        unlocker: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
        seller: {
          select: {
            email: true
          }
        },
        module: {
          select: {
            title: true
          }
        }
      },
      take: 5
    });

    console.log('📦 Derniers déverrouillages:\n');
    unlocks.forEach(unlock => {
      console.log(`Module: ${unlock.module.title}`);
      console.log(`Vendeur: ${unlock.seller.email}`);
      console.log(`Déverrouillé par ID: ${unlock.unlockedBy}`);
      console.log(`Unlocker data:`, unlock.unlocker);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
