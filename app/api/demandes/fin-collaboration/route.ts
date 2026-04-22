import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/zoho-mail';
import { renderEmailFinCollaboration } from '@/lib/email-templates';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['REFERENT', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { vendeur_email, vendeur_nom, date_fin, motif, commentaire } = await req.json();
  if (!vendeur_email || !date_fin || !motif) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { firstName: true, lastName: true } });

  const demande = await prisma.demande.create({
    data: {
      type: 'FIN_COLLABORATION', status: 'PENDING',
      fromEmail: session.user.email, fromName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(), fromRole: session.user.role,
      targetEmail: session.user.email,
      payload: JSON.stringify({ vendeur_email, vendeur_nom, date_fin, motif, commentaire }),
    },
  });

  try {
    await sendEmail({
      to: 'recrutement@liliwatt.fr',
      subject: `👋 Fin de collaboration — ${vendeur_nom || vendeur_email}`,
      html: renderEmailFinCollaboration({
        referent: { nom: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(), email: session.user.email },
        vendeur: { email: vendeur_email, nom: vendeur_nom || '' },
        date_fin, motif, commentaire,
      }),
    });
  } catch (e) { console.error('Email fin collab error:', e); }

  return NextResponse.json({ success: true, demande });
}
