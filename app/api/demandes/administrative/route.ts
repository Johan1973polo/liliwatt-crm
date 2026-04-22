import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/zoho-mail';
import { renderEmailAdministrative } from '@/lib/email-templates';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const { sujet, message } = await req.json();
  if (!sujet?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Sujet et message obligatoires' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { firstName: true, lastName: true, email: true, role: true },
  });
  if (!user) return NextResponse.json({ error: 'User introuvable' }, { status: 404 });

  const demande = await prisma.demande.create({
    data: {
      type: 'DEMANDE_ADMIN',
      status: 'PENDING',
      fromEmail: user.email,
      fromName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      fromRole: user.role,
      payload: JSON.stringify({ sujet, message }),
    },
  });

  try {
    await sendEmail({
      to: 'bo@liliwatt.fr',
      subject: `Demande administrative - ${sujet}`,
      html: renderEmailAdministrative({
        auteur_prenom: user.firstName || '',
        auteur_nom: user.lastName || '',
        auteur_email: user.email,
        auteur_role: user.role,
        sujet,
        message,
        date: new Date().toLocaleString('fr-FR', {
          day: '2-digit', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
      }),
    });
  } catch (e: any) {
    console.error('Email admin failed:', e.message);
  }

  return NextResponse.json({ success: true, demande });
}
