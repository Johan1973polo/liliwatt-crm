import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { finalizeUpload, deleteAudioFromDrive } from '@/lib/drive';

/**
 * PATCH — Étape 2 : confirme l'upload.
 * Le navigateur a uploadé le fichier directement vers Drive.
 * On reçoit {driveFileId} et on finalise (permissions + mise à jour base).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { driveFileId } = await request.json();

  if (!driveFileId) {
    return NextResponse.json({ error: 'driveFileId requis' }, { status: 400 });
  }

  const audio = await prisma.audioFile.findUnique({ where: { id: params.id } });
  if (!audio) {
    return NextResponse.json({ error: 'Audio non trouvé' }, { status: 404 });
  }

  try {
    // Rendre le fichier public en lecture
    const { webViewLink } = await finalizeUpload(driveFileId);

    // Mettre à jour l'enregistrement
    const updated = await prisma.audioFile.update({
      where: { id: params.id },
      data: {
        driveFileId,
        driveUrl: webViewLink,
      },
    });

    return NextResponse.json({ success: true, audio: updated });
  } catch (error) {
    console.error('Erreur confirmation upload:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * DELETE — Supprime un audio (Drive + Prisma).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const audio = await prisma.audioFile.findUnique({ where: { id: params.id } });
  if (!audio) {
    return NextResponse.json({ error: 'Audio non trouvé' }, { status: 404 });
  }

  if (audio.driveFileId && audio.driveFileId !== 'PENDING') {
    try {
      await deleteAudioFromDrive(audio.driveFileId);
    } catch (e) {
      console.error('Erreur suppression Drive:', e);
    }
  }

  await prisma.audioFile.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
