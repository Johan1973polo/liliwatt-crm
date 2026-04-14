import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
      authorName: null, // On utilise le numéro de courtier
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

export async function POST(request: NextRequest) {
  // Vérifier l'authentification : session utilisateur OU CRON secret
  const authHeader = request.headers.get('authorization');
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET;

  // Si header Authorization présent, vérifier le CRON secret
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    if (!cronSecret || token !== cronSecret) {
      return NextResponse.json({ error: 'Token CRON invalide' }, { status: 401 });
    }
  } else if (secretParam) {
    // Vérifier le secret via query parameter (pour Vercel CRON)
    if (!cronSecret || secretParam !== cronSecret) {
      return NextResponse.json({ error: 'Secret invalide' }, { status: 401 });
    }
  } else {
    // Sinon, vérifier qu'il y a une session authentifiée (n'importe quel rôle)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé - Authentification requise' }, { status: 403 });
    }
  }

  try {
    const responses: any[] = [];

    // Récupérer tous les courtiers fictifs actifs
    const allCourtiers = await prisma.fictionalCourtier.findMany({
      orderBy: { courtierNumber: 'asc' },
    });

    if (allCourtiers.length === 0) {
      return NextResponse.json({
        error: 'Aucun courtier fictif initialisé. Appelez /api/ai/init-courtiers d\'abord.'
      }, { status: 400 });
    }

    // 1. DÉTECTER LES ANNIVERSAIRES DU JOUR
    const today = new Date();
    const birthdayCourtiers = allCourtiers.filter(c => {
      const birthDate = new Date(c.birthDate);
      return birthDate.getDate() === today.getDate() &&
             birthDate.getMonth() === today.getMonth();
    });

    if (birthdayCourtiers.length > 0) {
      for (const courtier of birthdayCourtiers) {
        // Vérifier si le courtier a déjà posté aujourd'hui
        const existingBirthdayMessage = await prisma.teamActivity.findFirst({
          where: {
            courtierNumber: courtier.courtierNumber,
            message: { contains: 'anniversaire' },
            createdAt: {
              gte: new Date(today.setHours(0, 0, 0, 0)),
            },
          },
        });

        if (!existingBirthdayMessage) {
          const genResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/ai/generate-response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courtierNumber: courtier.courtierNumber,
              context: 'birthday',
            }),
          });

          if (genResponse.ok) {
            const { message } = await genResponse.json();
            await postAIMessage(courtier.courtierNumber, message);
            responses.push({ type: 'birthday', courtier: courtier.courtierNumber, message });

            // Quelques courtiers réagissent pour souhaiter bon anniversaire
            const responders = selectResponders(
              allCourtiers.filter(c => c.courtierNumber !== courtier.courtierNumber),
              Math.floor(Math.random() * 3) + 2, // 2-4 réponses
              'casual',
              courtier.courtierNumber
            );

            for (let i = 0; i < responders.length; i++) {
              const responder = responders[i];
              const wishMessage = [
                'Joyeux anniversaire ! 🎉',
                'Bon anniv !',
                'Bon anniversaire mec ! 🎂',
                'Félicitations ! Bonne journée',
              ][Math.floor(Math.random() * 4)];

              await postAIMessage(responder.courtierNumber, wishMessage);
              responses.push({ type: 'birthday_wish', from: responder.courtierNumber, to: courtier.courtierNumber });
            }
          }
        }
      }
    }

    // 2. DÉTECTER LES NOUVEAUX CHALLENGES
    const recentChallenge = await prisma.challenge.findFirst({
      where: {
        isActive: true,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Dernière heure
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentChallenge) {
      // Vérifier si des IA ont déjà réagi
      const existingReactions = await prisma.teamActivity.count({
        where: {
          isFictional: true,
          message: { contains: 'challenge' },
          createdAt: {
            gte: new Date(recentChallenge.createdAt),
          },
        },
      });

      if (existingReactions === 0) {
        // Sélectionner 3-5 courtiers compétitifs pour réagir
        const responders = selectResponders(allCourtiers, Math.floor(Math.random() * 3) + 3, 'challenge');

        for (let i = 0; i < responders.length; i++) {
          const responder = responders[i];

          const genResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/ai/generate-response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courtierNumber: responder.courtierNumber,
              context: 'challenge',
              additionalContext: recentChallenge.message,
            }),
          });

          if (genResponse.ok) {
            const { message } = await genResponse.json();
            await postAIMessage(responder.courtierNumber, message);
            responses.push({ type: 'challenge_reaction', courtier: responder.courtierNumber });
          }
        }
      }
    }

    // 3. DÉTECTER LES NOUVELLES VENTES (INVOICE/SALE)
    const recentSales = await prisma.teamActivity.findMany({
      where: {
        type: { in: ['SALE', 'INVOICE'] },
        isFictional: false, // Seulement les vraies ventes
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Dernière heure
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const sale of recentSales) {
      // Vérifier si des IA ont déjà félicité
      const existingCongrats = await prisma.teamActivity.count({
        where: {
          isFictional: true,
          replyToId: sale.id,
        },
      });

      if (existingCongrats === 0 && sale.courtierNumber) {
        // 1-2 courtiers félicitent
        const responders = selectResponders(
          allCourtiers,
          Math.floor(Math.random() * 2) + 1,
          'sale',
          sale.courtierNumber
        );

        for (let i = 0; i < responders.length; i++) {
          const responder = responders[i];

          const genResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/ai/generate-response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courtierNumber: responder.courtierNumber,
              context: 'sale',
              referenceMessage: sale.message,
            }),
          });

          if (genResponse.ok) {
            const { message } = await genResponse.json();
            await postAIMessage(responder.courtierNumber, message, sale.id, sale.courtierNumber);
            responses.push({ type: 'sale_congrats', from: responder.courtierNumber, to: sale.courtierNumber });
          }
        }
      }
    }

    // 4. DÉTECTER LES NOUVEAUX MESSAGES DES VRAIS VENDEURS
    const recentMessages = await prisma.teamActivity.findMany({
      where: {
        type: 'MESSAGE',
        isFictional: false, // Seulement les vrais vendeurs
        authorRole: { not: 'AI' },
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Dernière heure
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    for (const userMessage of recentMessages) {
      // Vérifier si des IA ont déjà répondu
      const existingReplies = await prisma.teamActivity.count({
        where: {
          isFictional: true,
          replyToId: userMessage.id,
        },
      });

      // 80% de chance de réponse si aucune IA n'a encore répondu
      if (existingReplies === 0 && Math.random() < 0.8) {
        // 2-4 courtiers répondent
        const responders = selectResponders(
          allCourtiers,
          Math.floor(Math.random() * 3) + 2, // 2-4 réponses
          'casual',
          userMessage.courtierNumber || undefined
        );

        for (const responder of responders) {
          const genResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/ai/generate-response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courtierNumber: responder.courtierNumber,
              context: 'casual',
              referenceMessage: userMessage.message,
            }),
          });

          if (genResponse.ok) {
            const { message } = await genResponse.json();
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
          }
        }
      }
    }

    // 5. MESSAGES D'AMBIANCE ALÉATOIRES (entre 9h et 20h, max 1 par heure)
    const currentHour = new Date().getHours();
    if (currentHour >= 9 && currentHour <= 20) {
      const lastAmbientMessage = await prisma.teamActivity.findFirst({
        where: {
          isFictional: true,
          type: 'MESSAGE',
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000), // Dernière heure
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Si aucun message d'ambiance depuis 1h, en poster un
      if (!lastAmbientMessage && Math.random() < 0.3) { // 30% de chance
        const randomCourtier = allCourtiers[Math.floor(Math.random() * allCourtiers.length)];

        const contexts = ['casual', 'payday', 'encouragement'];
        const context = contexts[Math.floor(Math.random() * contexts.length)];

        const genResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/ai/generate-response`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courtierNumber: randomCourtier.courtierNumber,
            context,
          }),
        });

        if (genResponse.ok) {
          const { message } = await genResponse.json();
          await postAIMessage(randomCourtier.courtierNumber, message);
          responses.push({ type: 'ambient', courtier: randomCourtier.courtierNumber, context });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Traitement des événements terminé`,
      responses,
      summary: {
        birthdays: responses.filter(r => r.type === 'birthday').length,
        challenges: responses.filter(r => r.type === 'challenge_reaction').length,
        sales: responses.filter(r => r.type === 'sale_congrats').length,
        messageReplies: responses.filter(r => r.type === 'message_reply').length,
        ambient: responses.filter(r => r.type === 'ambient').length,
      },
    });

  } catch (error) {
    console.error('Erreur lors du traitement des événements:', error);
    return NextResponse.json({
      error: 'Erreur lors du traitement des événements',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
