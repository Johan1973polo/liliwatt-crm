import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/zoho-mail';
import { renderEmailParrainage } from '@/lib/email-templates';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { prenom, nom, telephone, email, motivation } = await req.json();
  if (!prenom || !nom || !telephone || !email) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { firstName: true, lastName: true, referentId: true, referent: { select: { email: true } } } });

  const demande = await prisma.demande.create({
    data: {
      type: 'PARRAINAGE', status: 'PENDING',
      fromEmail: session.user.email, fromName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(), fromRole: session.user.role,
      targetEmail: user?.referent?.email || null,
      payload: JSON.stringify({ candidat: { prenom, nom, telephone, email }, motivation }),
    },
  });

  try {
    await sendEmail({
      to: 'recrutement@liliwatt.fr',
      subject: `🤝 Nouvelle recommandation — ${prenom} ${nom}`,
      html: renderEmailParrainage({
        auteur: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        auteur_email: session.user.email, auteur_role: session.user.role,
        candidat: { prenom, nom, telephone, email }, motivation,
      }),
    });
  } catch (e) { console.error('Email parrainage error:', e); }

  return NextResponse.json({ success: true, demande });
}
