import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

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

  // Supprimer du Blob Storage
  if (audio.driveUrl && audio.driveUrl.includes('vercel-storage') || audio.driveUrl.includes('blob')) {
    try {
      await del(audio.driveUrl);
      console.log(`🗑 Audio blob supprimé: ${audio.driveUrl}`);
    } catch (e) {
      console.error('Erreur suppression blob:', e);
    }
  }

  await prisma.audioFile.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
