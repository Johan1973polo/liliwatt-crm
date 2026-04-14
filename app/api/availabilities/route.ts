import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Si c'est un référent, récupérer les dispos de tous ses vendeurs
    if (session.user.role === 'REFERENT') {
      const availabilities = await prisma.availability.findMany({
        where: {
          date: today,
          user: {
            referentId: session.user.id,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
      return NextResponse.json({ availabilities });
    }

    // Sinon, récupérer seulement sa propre disponibilité
    const availability = await prisma.availability.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    });

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const body = await request.json();
  const { date, slots } = body;

  if (!date || !slots) {
    return NextResponse.json(
      { error: 'Date et créneaux requis' },
      { status: 400 }
    );
  }

  try {
    // Convertir la date en objet Date
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    // Vérifier si une disponibilité existe déjà pour cette date
    const existing = await prisma.availability.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: dateObj,
        },
      },
    });

    if (existing) {
      // Mettre à jour
      const updated = await prisma.availability.update({
        where: { id: existing.id },
        data: {
          slotsJson: JSON.stringify(slots),
        },
      });
      return NextResponse.json({ success: true, availability: updated });
    } else {
      // Créer
      const availability = await prisma.availability.create({
        data: {
          userId: session.user.id,
          date: dateObj,
          slotsJson: JSON.stringify(slots),
        },
      });
      return NextResponse.json({ success: true, availability });
    }
  } catch (error) {
    console.error('Erreur lors de la création de la disponibilité:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
