import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = (formData.get('description') as string) || '';

    if (!file || !title || !category) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    // Upload vers Vercel Blob
    const blob = await put(
      `audios/${Date.now()}-${file.name.replace(/\s/g, '-')}`,
      file,
      { access: 'public' }
    );

    // Sauvegarde en base
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
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const audios = await prisma.audioFile.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(audios);
}
