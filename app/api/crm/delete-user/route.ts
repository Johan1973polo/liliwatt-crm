import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key');
  if (apiKey !== process.env.CRM_API_KEY) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'email requis' }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { isActive: false, deletedAt: new Date() },
    });

    console.log(`🗑 Delete CRM: ${email} marqué supprimé`);
    return NextResponse.json({ success: true, email: user.email });
  } catch {
    return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
  }
}
