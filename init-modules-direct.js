const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initModules() {
  try {
    console.log('🔍 Vérification des modules existants...');

    const existingModules = await prisma.trainingModule.count();

    if (existingModules > 0) {
      console.log(`⚠️  ${existingModules} modules déjà présents dans la base de données.`);
      console.log('');
      console.log('👉 Si vous voulez les réinitialiser, exécutez d\'abord : node reset-modules.js');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Aucun module existant, initialisation en cours...');
    console.log('');

    // Importer les modules depuis le fichier route
    const fs = require('fs');
    const routePath = './app/api/training/init-modules/route.ts';
    const routeContent = fs.readFileSync(routePath, 'utf8');

    // Extraire le contenu des modules
    const modulesStart = routeContent.indexOf('const modules = [');
    const modulesEnd = routeContent.indexOf('];', modulesStart) + 2;
    const modulesCode = routeContent.substring(modulesStart, modulesEnd);

    // Évaluer le code pour obtenir les modules
    const modules = eval(modulesCode.replace('const modules = ', ''));

    console.log(`📚 Création de ${modules.length} modules de formation...`);
    console.log('');

    await prisma.trainingModule.createMany({
      data: modules,
    });

    console.log('✅ Modules créés avec succès !');
    console.log('');
    console.log('📋 Modules initialisés :');
    modules.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.title} (${m.durationEstimated} min)`);
    });
    console.log('');
    console.log('🎉 Initialisation terminée ! Rendez-vous sur http://localhost:3000/formation');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initModules();
