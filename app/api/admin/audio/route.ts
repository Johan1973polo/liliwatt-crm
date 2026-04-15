import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadAudioToDrive } from '@/lib/drive';

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

  // Max 50 MB
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 50 MB)' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { fileId, webViewLink } = await uploadAudioToDrive(buffer, file.name, file.type);

    const audio = await prisma.audioFile.create({
      data: {
        title,
        category,
        description,
        driveFileId: fileId,
        driveUrl: webViewLink,
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true, audio });
  } catch (error) {
    console.error('Erreur upload audio:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}
