const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAIProcessor() {
  console.log('🧪 Test du processeur IA...\n');

  try {
    // Vérifier le dernier message utilisateur
    const lastUserMessage = await prisma.teamActivity.findFirst({
      where: {
        type: 'MESSAGE',
        isFictional: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastUserMessage) {
      console.log('❌ Aucun message utilisateur trouvé');
      return;
    }

    console.log(`📨 Dernier message: "${lastUserMessage.message}"`);
    console.log(`   De: N°${lastUserMessage.courtierNumber}`);
    console.log(`   Date: ${lastUserMessage.createdAt}\n`);

    // Vérifier les réponses IA
    const aiReplies = await prisma.teamActivity.findMany({
      where: {
        isFictional: true,
        replyToId: lastUserMessage.id,
      },
    });

    console.log(`🤖 Réponses IA: ${aiReplies.length}`);

    if (aiReplies.length === 0) {
      console.log('⚠️  PROBLÈME: Aucune réponse IA générée!\n');

      // Vérifier si on a des courtiers fictifs
      const courtiersCount = await prisma.fictionalCourtier.count();
      console.log(`👥 Courtiers fictifs disponibles: ${courtiersCount}`);

      if (courtiersCount === 0) {
        console.log('❌ ERREUR: Aucun courtier fictif dans la DB!');
      } else {
        console.log('✅ Courtiers OK, le problème est dans le traitement...');
      }
    } else {
      console.log('✅ Réponses IA générées avec succès:');
      aiReplies.forEach(reply => {
        console.log(`   - N°${reply.courtierNumber}: "${reply.message}"`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAIProcessor();
