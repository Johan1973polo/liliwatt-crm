const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupMessages() {
  console.log('🧹 Nettoyage des anciens messages...\n');

  try {
    // Supprimer tous les messages MESSAGE (pas les SALE ni INVOICE)
    const result = await prisma.teamActivity.deleteMany({
      where: {
        type: 'MESSAGE',
      },
    });

    console.log(`✅ ${result.count} messages supprimés avec succès`);

    // Vérifier ce qu'il reste
    const remaining = await prisma.teamActivity.groupBy({
      by: ['type'],
      _count: true,
    });

    console.log('\n📊 Activités restantes:');
    remaining.forEach(r => {
      console.log(`   - ${r.type}: ${r._count} entrées`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupMessages();
