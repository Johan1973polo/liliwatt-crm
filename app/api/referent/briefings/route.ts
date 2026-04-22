import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/zoho-mail';
import { renderEmailBriefing } from '@/lib/email-templates';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'REFERENT') {
    return NextResponse.json({ error: 'Acces referent requis' }, { status: 401 });
  }

  const { date, time, message } = await req.json();
  if (!date || !time) {
    return NextResponse.json({ error: 'Date et heure obligatoires' }, { status: 400 });
  }

  const scheduledAt = new Date(`${date}T${time}:00`);

  const referent = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, firstName: true, lastName: true, linkVisio: true,
      vendeurs: { where: { isActive: true }, select: { id: true, email: true, firstName: true } },
    },
  });
  if (!referent) return NextResponse.json({ error: 'Referent introuvable' }, { status: 404 });

  const dateFormatted = scheduledAt.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeFormatted = scheduledAt.toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });

  // Creer une annonce en base
  await prisma.referentAnnouncement.create({
    data: {
      referentId: referent.id,
      title: `Briefing ${dateFormatted} a ${timeFormatted}`,
      message: message || `Vous etes convie(e) au briefing du ${dateFormatted} a ${timeFormatted}. Merci de rejoindre le salon Meet.`,
    },
  });

  // Envoyer email a chaque vendeur
  const emailResults: { email: string; status: string }[] = [];
  for (const v of referent.vendeurs) {
    try {
      await sendEmail({
        to: v.email,
        subject: `Briefing ${referent.firstName} ${referent.lastName} - ${dateFormatted}`,
        html: renderEmailBriefing({
          vendeur_prenom: v.firstName || '',
          referent_prenom: referent.firstName || '',
          referent_nom: referent.lastName || '',
          referent_visio: referent.linkVisio || '',
          date: dateFormatted,
          time: timeFormatted,
          message: message || '',
        }),
      });
      emailResults.push({ email: v.email, status: 'sent' });
    } catch (e) {
      console.error(`Email failed for ${v.email}:`, e);
      emailResults.push({ email: v.email, status: 'failed' });
    }
  }

  return NextResponse.json({
    success: true,
    invited: referent.vendeurs.length,
    emails: emailResults,
  });
}
