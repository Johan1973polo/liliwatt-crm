import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const audios = await prisma.audioFile.findMany({
    orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    include: { uploader: { select: { firstName: true, lastName: true, email: true } } },
  });

  return NextResponse.json(audios);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const category = formData.get('category') as string;
  const description = (formData.get('description') as string) || null;
  const file = formData.get('file') as File;

  if (!title || !category || !file) {
    return NextResponse.json({ error: 'Titre, catégorie et fichier requis' }, { status: 400 });
  }

  if (!['PROSPECTION', 'CLOSING'].includes(category)) {
    return NextResponse.json({ error: 'Catégorie invalide' }, { status: 400 });
  }

  try {
    // Upload vers Vercel Blob (jusqu'à 500 MB, pas de CORS)
    const blob = await put(
      `audios/${Date.now()}-${file.name}`,
      file,
      { access: 'public' }
    );

    const audio = await prisma.audioFile.create({
      data: {
        title,
        category,
        description,
        driveFileId: blob.pathname,
        driveUrl: blob.url,
        uploadedBy: session.user.id,
      },
    });

    console.log(`🎵 Audio uploadé: ${file.name} → ${blob.url}`);
    return NextResponse.json({ success: true, audio });
  } catch (error: any) {
    console.error('AUDIO UPLOAD ERROR:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
