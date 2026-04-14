const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

const module8HTML = fs.readFileSync('/tmp/module8-complet.html', 'utf8');
const module9HTML = fs.readFileSync('/tmp/module9-complet.html', 'utf8');

async function updateModules() {
  try {
    console.log('🚀 Début de la mise à jour des modules 8 et 9...\n');

    // MODULE 8 : Remplacement complet
    console.log('📝 Module 8 : Organisation en télétravail...');
    const module8 = await prisma.trainingModule.findFirst({ where: { order: 8 } });
    if (module8) {
      await prisma.trainingModule.update({
        where: { id: module8.id },
        data: {
          content: module8HTML.trim(),
          icon: 'bi-house-door'
        }
      });
      console.log('✅ Module 8 mis à jour (' + module8HTML.length + ' caractères)\n');
    } else {
      console.log('❌ Module 8 non trouvé en base de données\n');
    }

    // MODULE 9 : Remplacement complet
    console.log('📝 Module 9 : Manuel interne Culture LILIWATT Alpha...');
    const module9 = await prisma.trainingModule.findFirst({ where: { order: 9 } });
    if (module9) {
      await prisma.trainingModule.update({
        where: { id: module9.id },
        data: {
          content: module9HTML.trim(),
          icon: 'bi-trophy'
        }
      });
      console.log('✅ Module 9 mis à jour (' + module9HTML.length + ' caractères)\n');
    } else {
      console.log('❌ Module 9 non trouvé en base de données\n');
    }

    console.log('🎉 Modules 8 et 9 mis à jour avec succès !');
    console.log('👉 Vérifiez sur : https://crm-televendeur.vercel.app/formation');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateModules();
