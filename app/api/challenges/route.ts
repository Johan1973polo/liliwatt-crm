import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer le challenge actif
export async function GET() {
  try {
    const activeChallenge = await prisma.challenge.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ challenge: activeChallenge });
  } catch (error) {
    console.error('Erreur lors de la récupération du challenge:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau challenge
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const body = await request.json();
  const { message } = body;

  if (!message || message.trim() === '') {
    return NextResponse.json(
      { error: 'Le message du challenge est requis' },
      { status: 400 }
    );
  }

  try {
    // Désactiver tous les challenges existants
    await prisma.challenge.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Créer le nouveau challenge
    const challenge = await prisma.challenge.create({
      data: {
        message: message.trim(),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, challenge });
  } catch (error) {
    console.error('Erreur lors de la création du challenge:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer le challenge actif (marquer comme gagné)
export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    // Désactiver tous les challenges actifs
    await prisma.challenge.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du challenge:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
