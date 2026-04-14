import { prisma } from '@/lib/prisma';

// Détecter les mentions de courtiers dans un message (N°3, numero 3, @3, etc.)
function detectMentions(message: string): number[] {
  const mentions: number[] = [];

  // Patterns pour détecter les mentions
  const patterns = [
    /N°(\d+)/gi,           // N°3
    /N\s*°\s*(\d+)/gi,     // N ° 3
    /numero\s*(\d+)/gi,    // numero 3
    /numéro\s*(\d+)/gi,    // numéro 3
    /@(\d+)/g,             // @3
  ];

  for (const pattern of patterns) {
    const matches = message.matchAll(pattern);
    for (const match of matches) {
      const number = parseInt(match[1]);
      if (number >= 1 && number <= 30 && !mentions.includes(number)) {
        mentions.push(number);
      }
    }
  }

  console.log(`[AI Processor] Mentions détectées dans "${message}": ${mentions.join(', ') || 'aucune'}`);
  return mentions;
}

// Sélectionner des courtiers qui vont répondre en fonction des affinités
function selectResponders(
  allCourtiers: any[],
  maxResponders: number,
  eventType: string,
  sourceCourtierNumber?: number
): any[] {
  const selected: any[] = [];

  // Si c'est une réponse à un courtier spécifique, prioriser ses affinités
  if (sourceCourtierNumber) {
    const sourceCourtier = allCourtiers.find(c => c.courtierNumber === sourceCourtierNumber);
    if (sourceCourtier) {
      const affinities = JSON.parse(sourceCourtier.affinitiesJson) as number[];
      const affinityCourtiers = allCourtiers.filter(c => affinities.includes(c.courtierNumber));

      // Prendre 1-2 courtiers avec affinité
      const numAffinities = Math.min(Math.floor(Math.random() * 2) + 1, affinityCourtiers.length);
      for (let i = 0; i < numAffinities && selected.length < maxResponders; i++) {
        const randomIndex = Math.floor(Math.random() * affinityCourtiers.length);
        const courtier = affinityCourtiers.splice(randomIndex, 1)[0];
        if (courtier) selected.push(courtier);
      }
    }
  }

  // Compléter avec des courtiers aléatoires en fonction de leur personnalité
  const remaining = allCourtiers.filter(c => !selected.includes(c));

  // Filtrer selon le type d'événement
  let filtered = remaining;
  if (eventType === 'challenge') {
    // Prioriser les compétitifs, motivés, ambitieux
    filtered = remaining.filter(c =>
      c.personality.includes('compétitif') ||
      c.personality.includes('motivé') ||
      c.personality.includes('ambitieux')
    );
  } else if (eventType === 'encouragement') {
    // Prioriser les bienveillants, empathiques, leaders
    filtered = remaining.filter(c =>
      c.personality.includes('bienveillant') ||
      c.personality.includes('empathique') ||
      c.personality.includes('leader')
    );
  }

  // Si pas assez de courtiers filtrés, reprendre tous
  if (filtered.length < (maxResponders - selected.length)) {
    filtered = remaining;
  }

  // Compléter jusqu'au max
  while (selected.length < maxResponders && filtered.length > 0) {
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const courtier = filtered.splice(randomIndex, 1)[0];
    if (courtier) selected.push(courtier);
  }

  return selected;
}

// Poster un message IA sans délai (pour éviter les timeouts Vercel)
async function postAIMessage(
  courtierNumber: number,
  message: string,
  replyToId?: string,
  mentionedCourtierNumber?: number
): Promise<void> {
  await prisma.teamActivity.create({
    data: {
      type: 'MESSAGE',
      message,
      courtierNumber,
      mentionedCourtierNumber: mentionedCourtierNumber || null,
      replyToId: replyToId || null,
      authorRole: 'AI',
      authorName: null,
      isFictional: true,
      isManual: false,
    },
  });

  // Mettre à jour le courtier fictif
  await prisma.fictionalCourtier.update({
    where: { courtierNumber },
    data: {
      lastActive: new Date(),
      totalMessages: {
        increment: 1,
      },
    },
  });
}

export async function processAIEvents() {
  console.log('[AI Processor] Démarrage du traitement des événements IA...');

  try {
    const responses: any[] = [];

    // Récupérer tous les courtiers fictifs actifs
    const allCourtiers = await prisma.fictionalCourtier.findMany({
      orderBy: { courtierNumber: 'asc' },
    });

    if (allCourtiers.length === 0) {
      console.log('[AI Processor] Aucun courtier fictif trouvé');
      return {
        success: false,
        error: 'Aucun courtier fictif initialisé'
      };
    }

    console.log(`[AI Processor] ${allCourtiers.length} courtiers fictifs trouvés`);

    // 1. DÉTECTER LES NOUVELLES VENTES ET FACTURES (priorité 1)
    const recentSalesAndInvoices = await prisma.teamActivity.findMany({
      where: {
        type: { in: ['SALE', 'INVOICE'] },
        isFictional: false,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Dernière heure
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`[AI Processor] ${recentSalesAndInvoices.length} ventes/factures récentes trouvées`);

    // Féliciter les ventes et factures
    for (const event of recentSalesAndInvoices) {
      // Vérifier si des IA ont déjà félicité
      const existingCongrats = await prisma.teamActivity.count({
        where: {
          isFictional: true,
          replyToId: event.id,
        },
      });

      console.log(`[AI Processor] ${event.type} de N°${event.courtierNumber} - ${existingCongrats} félicitations IA existantes`);

      // 90% de chance de féliciter si personne n'a encore réagi
      if (existingCongrats === 0 && Math.random() < 0.9) {
        // Sélectionner 2-3 courtiers pour féliciter
        const congratulators = selectResponders(
          allCourtiers,
          Math.floor(Math.random() * 2) + 2, // 2-3 réponses
          event.type === 'SALE' ? 'sale' : 'encouragement',
          event.courtierNumber || undefined
        );

        console.log(`[AI Processor] ${congratulators.length} courtiers vont féliciter`);

        for (const congratulator of congratulators) {
          try {
            const { generateMessage } = await import('@/lib/message-generator');

            const message = await generateMessage({
              courtierNumber: congratulator.courtierNumber,
              context: event.type === 'SALE' ? 'sale' : 'encouragement',
              referenceMessage: event.type === 'SALE' ? `Vente de ${event.amount}€` : 'Facture récupérée',
            });

            console.log(`[AI Processor] Courtier N°${congratulator.courtierNumber} félicite: "${message}"`);

            await postAIMessage(
              congratulator.courtierNumber,
              message,
              event.id,
              event.courtierNumber || undefined
            );
            responses.push({
              type: event.type === 'SALE' ? 'sale_congrats' : 'invoice_congrats',
              from: congratulator.courtierNumber,
              to: event.courtierNumber,
            });
          } catch (error) {
            console.error(`[AI Processor] Erreur félicitation pour courtier N°${congratulator.courtierNumber}:`, error);
          }
        }
      }
    }

    // 2. DÉTECTER LES NOUVEAUX MESSAGES DES VRAIS VENDEURS (priorité 2)
    const recentMessages = await prisma.teamActivity.findMany({
      where: {
        type: 'MESSAGE',
        isFictional: false,
        authorRole: { not: 'AI' },
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Dernière heure
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`[AI Processor] ${recentMessages.length} messages récents de vrais vendeurs trouvés`);

    for (const userMessage of recentMessages) {
      // Vérifier si des IA ont déjà répondu
      const existingReplies = await prisma.teamActivity.count({
        where: {
          isFictional: true,
          replyToId: userMessage.id,
        },
      });

      console.log(`[AI Processor] Message "${userMessage.message}" - ${existingReplies} réponses IA existantes`);

      // 80% de chance de réponse si aucune IA n'a encore répondu
      if (existingReplies === 0 && Math.random() < 0.8) {
        // Détecter les mentions dans le message
        const mentions = detectMentions(userMessage.message || '');
        let responders: any[] = [];

        // Si des courtiers sont mentionnés, ils répondent en priorité
        if (mentions.length > 0) {
          console.log(`[AI Processor] ${mentions.length} courtier(s) mentionné(s): ${mentions.join(', ')}`);

          // Ajouter les courtiers mentionnés qui existent
          for (const mentionedNumber of mentions) {
            const mentionedCourtier = allCourtiers.find(c => c.courtierNumber === mentionedNumber);
            if (mentionedCourtier && !responders.includes(mentionedCourtier)) {
              responders.push(mentionedCourtier);
            }
          }

          // Si on veut plus de réponses, compléter avec d'autres courtiers
          if (responders.length < 2) {
            const remaining = allCourtiers.filter(c => !responders.includes(c));
            const additional = selectResponders(
              remaining,
              2 - responders.length,
              'casual',
              userMessage.courtierNumber || undefined
            );
            responders = [...responders, ...additional];
          }
        } else {
          // Pas de mention : logique normale (2-4 courtiers aléatoires)
          responders = selectResponders(
            allCourtiers,
            Math.floor(Math.random() * 3) + 2, // 2-4 réponses
            'casual',
            userMessage.courtierNumber || undefined
          );
        }

        console.log(`[AI Processor] ${responders.length} courtiers vont répondre`);

        for (const responder of responders) {
          try {
            // Import dynamique de la fonction de génération
            const { generateMessage } = await import('@/lib/message-generator');

            const message = await generateMessage({
              courtierNumber: responder.courtierNumber,
              context: 'casual',
              referenceMessage: userMessage.message || undefined,
            });

            console.log(`[AI Processor] Courtier N°${responder.courtierNumber} génère: "${message}"`);

            await postAIMessage(
              responder.courtierNumber,
              message,
              userMessage.id,
              userMessage.courtierNumber || undefined
            );
            responses.push({
              type: 'message_reply',
              from: responder.courtierNumber,
              to: userMessage.courtierNumber,
              originalMessage: userMessage.message
            });
          } catch (error) {
            console.error(`[AI Processor] Erreur génération pour courtier N°${responder.courtierNumber}:`, error);
          }
        }
      }
    }

    console.log(`[AI Processor] Traitement terminé - ${responses.length} réponses générées`);

    return {
      success: true,
      message: `Traitement des événements terminé`,
      responses,
      summary: {
        saleCongrats: responses.filter(r => r.type === 'sale_congrats').length,
        invoiceCongrats: responses.filter(r => r.type === 'invoice_congrats').length,
        messageReplies: responses.filter(r => r.type === 'message_reply').length,
      },
    };

  } catch (error) {
    console.error('[AI Processor] Erreur lors du traitement des événements:', error);
    return {
      success: false,
      error: 'Erreur lors du traitement des événements',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
