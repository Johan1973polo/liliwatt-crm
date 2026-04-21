import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !['VENDEUR', 'REFERENT'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const body = await request.json();
  const { type, amount } = body; // type: 'INVOICE' ou 'SALE', amount pour les ventes

  if (!type || !['INVOICE', 'SALE'].includes(type)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  }

  if (type === 'SALE' && (!amount || isNaN(parseFloat(amount)))) {
    return NextResponse.json({ error: 'Montant requis pour une vente' }, { status: 400 });
  }

  try {
    // Récupérer tous les utilisateurs actifs
    const allUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    // Récupérer les infos du vendeur avec son courtierNumber
    const vendor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, courtierNumber: true },
    });

    // Vérifier que le vendeur a un numéro de courtier
    if (!vendor?.courtierNumber) {
      return NextResponse.json({
        error: 'Vous devez avoir un numéro de courtier attribué pour faire une annonce'
      }, { status: 400 });
    }

    // Créer un message JSON avec les détails
    const messageData = {
      vendorEmail: vendor?.email,
      type,
      ...(type === 'SALE' && { amount: parseFloat(amount) }),
    };

    // Créer l'activité dans le fil de performances
    await prisma.teamActivity.create({
      data: {
        type,
        amount: type === 'SALE' ? parseFloat(amount) : null,
        courtierNumber: vendor.courtierNumber,
        isManual: false, // C'est une vraie activité d'un vendeur
      },
    });

    // Créer des notifications pour tous les utilisateurs
    const notifications = allUsers.map((user) => ({
      userId: user.id,
      kind: type === 'INVOICE' ? 'INVOICE_RECEIVED' : 'SALE_MADE',
      entityId: session.user.id, // L'ID du vendeur
      isRead: user.id === session.user.id, // Marquer comme lu pour l'émetteur
      metadata: JSON.stringify(messageData),
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la création de l\'annonce:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
