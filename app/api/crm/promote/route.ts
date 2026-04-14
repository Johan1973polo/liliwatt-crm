import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key');
  if (apiKey !== process.env.CRM_API_KEY) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { email, role } = await req.json();

  if (!email || !['VENDEUR', 'REFERENT'].includes(role)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role },
    });

    console.log(`✅ Promotion CRM: ${email} → ${role}`);
    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Erreur promotion:', error);
    return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
  }
}
