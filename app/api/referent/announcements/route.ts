import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/zoho-mail';
import { renderEmailAnnonceReferent } from '@/lib/email-templates';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['REFERENT', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Accès référent requis' }, { status: 401 });
  }

  const { title, message } = await req.json();
  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Titre et message obligatoires' }, { status: 400 });
  }

  const referent = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, firstName: true, lastName: true, linkVisio: true, vendeurs: { where: { isActive: true }, select: { id: true, email: true, firstName: true } } },
  });
  if (!referent) return NextResponse.json({ error: 'Référent introuvable' }, { status: 404 });

  const announcement = await prisma.referentAnnouncement.create({
    data: { referentId: referent.id, title: title.trim(), message: message.trim() },
  });

  const emailResults: any[] = [];
  for (const v of referent.vendeurs) {
    try {
      await sendEmail({
        to: v.email,
        subject: `📢 ${referent.firstName} ${referent.lastName} — ${title}`,
        html: renderEmailAnnonceReferent({
          vendeur_prenom: v.firstName || '', referent_prenom: referent.firstName || '',
          referent_nom: referent.lastName || '', referent_lien_visio: referent.linkVisio || '',
          title: title.trim(), message: message.trim(),
          date: new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        }),
      });
      emailResults.push({ email: v.email, status: 'sent' });
    } catch (e) {
      emailResults.push({ email: v.email, status: 'failed' });
    }
  }

  return NextResponse.json({ success: true, announcement, recipients: referent.vendeurs.length, emails: emailResults });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ items: [] });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, referentId: true },
  });
  if (!user) return NextResponse.json({ items: [] });

  let items: any[] = [];
  if (user.role === 'REFERENT' || user.role === 'ADMIN') {
    items = await prisma.referentAnnouncement.findMany({ where: { referentId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 });
  } else if (user.role === 'VENDEUR' && user.referentId) {
    items = await prisma.referentAnnouncement.findMany({
      where: { referentId: user.referentId }, orderBy: { createdAt: 'desc' }, take: 50,
      include: { reads: { where: { userId: user.id }, select: { readAt: true } } },
    });
  }

  return NextResponse.json({ items });
}
