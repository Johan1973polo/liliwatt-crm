import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key');
  if (apiKey !== process.env.CRM_API_KEY) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { email, actif } = await req.json();

  if (!email || typeof actif !== 'boolean') {
    return NextResponse.json({ error: 'email et actif requis' }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { isActive: actif },
    });

    console.log(`✅ Toggle CRM: ${email} → ${actif ? 'ACTIF' : 'INACTIF'}`);
    return NextResponse.json({ success: true, email: user.email, isActive: user.isActive });
  } catch {
    return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
  }
}
