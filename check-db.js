const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDB() {
  try {
    // 1. Compter les courtiers fictifs
    const courtiersCount = await prisma.fictionalCourtier.count();
    console.log(`\n📊 Courtiers fictifs dans la DB: ${courtiersCount}`);

    if (courtiersCount > 0) {
      const sample = await prisma.fictionalCourtier.findMany({ take: 3 });
      console.log('\n✅ Exemples de courtiers:');
      sample.forEach(c => console.log(`   - N°${c.courtierNumber}: ${c.firstName} ${c.lastName}`));
    }

    // 2. Messages récents (dernières 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentMessages = await prisma.teamActivity.findMany({
      where: {
        type: 'MESSAGE',
        createdAt: { gte: fiveMinutesAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`\n📨 Messages des 5 dernières minutes: ${recentMessages.length}`);
    recentMessages.forEach(m => {
      const type = m.isFictional ? '🤖 IA' : '👤 Réel';
      const author = m.authorName || `N°${m.courtierNumber}` || 'Anonyme';
      const preview = m.message ? m.message.substring(0, 50) : '';
      console.log(`   ${type} ${author}: "${preview}..."`);
    });

    // 3. Dernier message réel (non IA)
    const lastRealMessage = await prisma.teamActivity.findFirst({
      where: {
        type: 'MESSAGE',
        isFictional: false,
        authorRole: { not: 'AI' }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (lastRealMessage) {
      console.log(`\n💬 Dernier message réel:`);
      const authorDisplay = lastRealMessage.authorName || 'N°' + lastRealMessage.courtierNumber;
      console.log(`   De: ${authorDisplay}`);
      console.log(`   Message: "${lastRealMessage.message}"`);
      console.log(`   Date: ${lastRealMessage.createdAt}`);

      // Vérifier si des IA ont répondu
      const aiReplies = await prisma.teamActivity.count({
        where: {
          isFictional: true,
          replyToId: lastRealMessage.id
        }
      });
      console.log(`   Réponses IA: ${aiReplies}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDB();
