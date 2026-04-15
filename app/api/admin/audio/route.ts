import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/aac'],
        maximumSizeInBytes: 100 * 1024 * 1024,
        tokenPayload: JSON.stringify({
          userId: session.user.id,
        }),
      }),
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('🎵 Blob upload completed:', blob.url);
        // Note: onUploadCompleted est appelé par Vercel en webhook,
        // la session n'est plus disponible ici. On utilise tokenPayload.
        try {
          const payload = JSON.parse(tokenPayload || '{}');
          // L'enregistrement Prisma sera créé côté client après l'upload
          console.log('✅ Upload finalisé pour userId:', payload.userId);
        } catch (e) {
          console.error('onUploadCompleted error:', e);
        }
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error('AUDIO UPLOAD ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Route séparée pour sauvegarder les métadonnées après upload client
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { title, category, description, blobUrl, blobPathname } = await request.json();

  if (!title || !category || !blobUrl) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  const audio = await prisma.audioFile.create({
    data: {
      title,
      category,
      description: description || '',
      driveFileId: blobPathname || blobUrl,
      driveUrl: blobUrl,
      uploadedBy: session.user.id,
    },
  });

  console.log(`✅ Audio enregistré: ${title} → ${blobUrl}`);
  return NextResponse.json({ success: true, audio });
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const audios = await prisma.audioFile.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(audios);
}
