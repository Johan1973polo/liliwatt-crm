const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

const module1HTML = fs.readFileSync('/tmp/module1-complet.html', 'utf8');
const module2HTML = fs.readFileSync('/tmp/module2-complet.html', 'utf8');

const liliwattWarning = `<div class="alert alert-warning border-0 shadow-sm mb-4">
  <h5 class="alert-heading"><i class="bi bi-exclamation-triangle me-2"></i>Document confidentiel</h5>
  <p class="mb-0">Ce document est à usage interne uniquement. LILIWATT en est le propriétaire. Il ne peut être transmis à des tiers.</p>
</div>

`;

async function updateAllModules() {
  try {
    console.log('🚀 Début de la mise à jour des modules...\n');

    // MODULE 1 : Remplacement complet
    console.log('📝 Module 1 : Remplacement complet...');
    const module1 = await prisma.trainingModule.findFirst({ where: { order: 1 } });
    if (module1) {
      await prisma.trainingModule.update({
        where: { id: module1.id },
        data: {
          content: module1HTML.trim(),
          icon: 'bi-diagram-3'
        }
      });
      console.log('✅ Module 1 mis à jour (' + module1HTML.length + ' caractères)\n');
    }

    // MODULE 2 : Remplacement complet
    console.log('📝 Module 2 : Remplacement complet...');
    const module2 = await prisma.trainingModule.findFirst({ where: { order: 2 } });
    if (module2) {
      await prisma.trainingModule.update({
        where: { id: module2.id },
        data: { content: module2HTML.trim() }
      });
      console.log('✅ Module 2 mis à jour (' + module2HTML.length + ' caractères)\n');
    }

    // MODULES 3-9 : Ajout de l'avertissement LILIWATT si pas déjà présent
    for (let order = 3; order <= 9; order++) {
      console.log(`📝 Module ${order} : Ajout avertissement LILIWATT...`);
      const module = await prisma.trainingModule.findFirst({ where: { order } });

      if (module) {
        // Vérifier si l'avertissement existe déjà
        if (!module.content.includes('Ce document est à usage interne uniquement')) {
          // Trouver la fin du premier hero div
          const heroEndMatch = module.content.match(/<\/div>\s*\n/);

          if (heroEndMatch) {
            const heroEndIndex = heroEndMatch.index + heroEndMatch[0].length;
            const newContent =
              module.content.substring(0, heroEndIndex) +
              '\n' +
              liliwattWarning +
              module.content.substring(heroEndIndex);

            await prisma.trainingModule.update({
              where: { id: module.id },
              data: { content: newContent }
            });
            console.log(`✅ Module ${order} : Avertissement ajouté\n`);
          } else {
            console.log(`⚠️  Module ${order} : Structure non reconnue, avertissement ajouté au début\n`);
            await prisma.trainingModule.update({
              where: { id: module.id },
              data: { content: liliwattWarning + module.content }
            });
          }
        } else {
          console.log(`ℹ️  Module ${order} : Avertissement déjà présent\n`);
        }
      }
    }

    console.log('🎉 Tous les modules ont été mis à jour avec succès !');
    console.log('👉 Vérifiez sur : https://crm-televendeur.vercel.app/formation');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateAllModules();
