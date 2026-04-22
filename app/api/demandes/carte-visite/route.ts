import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/zoho-mail';
import { renderEmailCarteVisite } from '@/lib/email-templates';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { prenom, nom, poste, telephone, email_carte, adresse } = await req.json();
  if (!prenom || !nom || !poste || !telephone) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }

  const demande = await prisma.demande.create({
    data: {
      type: 'CARTE_VISITE', status: 'PENDING',
      fromEmail: session.user.email, fromName: `${prenom} ${nom}`, fromRole: session.user.role,
      payload: JSON.stringify({ prenom, nom, poste, telephone, email_carte, adresse }),
    },
  });

  try {
    await sendEmail({
      to: 'contact@liliwatt.fr',
      subject: `💳 Demande de carte de visite — ${prenom} ${nom}`,
      html: renderEmailCarteVisite({
        demandeur: { nom: `${prenom} ${nom}`, email: session.user.email, role: session.user.role, telephone },
        poste, telephone_carte: telephone, adresse: adresse || {},
      }),
    });
  } catch (e) { console.error('Email carte error:', e); }

  return NextResponse.json({ success: true, demande });
}
