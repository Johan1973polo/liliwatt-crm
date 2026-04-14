const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

const content = fs.readFileSync('/tmp/module5-complet.html', 'utf8');

async function updateModule5() {
  try {
    console.log('🔍 Recherche du Module 5 en production...');
    
    const module5 = await prisma.trainingModule.findFirst({
      where: { order: 5 }
    });

    if (!module5) {
      console.error('❌ Module 5 non trouvé');
      return;
    }

    console.log('📝 Mise à jour:', module5.title);
    console.log('📊 Taille du contenu:', content.length, 'caractères');
    
    await prisma.trainingModule.update({
      where: { id: module5.id },
      data: { content: content.trim() }
    });

    console.log('✅ Module 5 mis à jour avec succès !');
    console.log('👉 Visible sur: https://crm-televendeur.vercel.app/formation');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateModule5();
