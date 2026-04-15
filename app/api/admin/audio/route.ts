import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createResumableUpload } from '@/lib/drive';

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

/**
 * Étape 1 : prépare l'upload.
 * Reçoit JSON {title, category, description, filename, mimeType, fileSize}
 * Crée un enregistrement PENDING en base + initie un upload resumable sur Drive.
 * Retourne {audioId, uploadUrl} pour que le navigateur upload directement.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const body = await request.json();
  const { title, category, description, filename, mimeType, fileSize } = body;

  if (!title || !category || !filename || !mimeType || !fileSize) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }

  if (!['PROSPECTION', 'CLOSING'].includes(category)) {
    return NextResponse.json({ error: 'Catégorie invalide' }, { status: 400 });
  }

  if (fileSize > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 50 MB)' }, { status: 400 });
  }

  try {
    // Créer l'enregistrement PENDING
    const audio = await prisma.audioFile.create({
      data: {
        title,
        category,
        description: description || null,
        driveFileId: 'PENDING',
        driveUrl: '',
        uploadedBy: session.user.id,
      },
    });

    // Initier l'upload resumable sur Drive
    const { uploadUrl } = await createResumableUpload(filename, mimeType, fileSize);

    return NextResponse.json({ audioId: audio.id, uploadUrl });
  } catch (error) {
    console.error('Erreur préparation upload:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
