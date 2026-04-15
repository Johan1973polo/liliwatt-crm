import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteAudioFromDrive } from '@/lib/drive';

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

  try {
    await deleteAudioFromDrive(audio.driveFileId);
  } catch (e) {
    console.error('Erreur suppression Drive:', e);
  }

  await prisma.audioFile.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
