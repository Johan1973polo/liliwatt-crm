import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key');
  if (apiKey !== process.env.CRM_API_KEY) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { vendeur_email, referent_email } = await req.json();

    if (!vendeur_email) {
      return NextResponse.json({ error: 'vendeur_email requis' }, { status: 400 });
    }

    let referentId: string | null = null;
    if (referent_email) {
      const referent = await prisma.user.findUnique({
        where: { email: referent_email.toLowerCase() },
      });
      if (!referent) {
        return NextResponse.json({ error: `Référent ${referent_email} introuvable` }, { status: 404 });
      }
      referentId = referent.id;
    }

    const vendeur = await prisma.user.update({
      where: { email: vendeur_email.toLowerCase() },
      data: { referentId },
    });

    console.log(`✅ Assign referent: ${vendeur_email} → ${referent_email || 'aucun'}`);
    return NextResponse.json({ success: true, vendeur: { email: vendeur.email, referentId: vendeur.referentId } });
  } catch (error: any) {
    console.error('assign-referent error:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
