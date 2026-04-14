const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetModules() {
  try {
    console.log('🗑️  Suppression des modules existants...');

    // Supprimer toutes les progressions
    await prisma.trainingProgress.deleteMany({});
    console.log('✅ Progressions supprimées');

    // Supprimer tous les modules
    await prisma.trainingModule.deleteMany({});
    console.log('✅ Modules supprimés');

    console.log('');
    console.log('✅ Base de données nettoyée !');
    console.log('');
    console.log('👉 Maintenant, va sur http://localhost:3000/admin/formation-init');
    console.log('👉 Et clique sur "Initialiser les 9 modules"');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetModules();
