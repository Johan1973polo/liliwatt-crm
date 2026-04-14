import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ⚠️ ENDPOINT TEMPORAIRE - À SUPPRIMER APRÈS UTILISATION
// Cet endpoint permet d'ajouter la colonne specialty à la table User
export async function POST() {
  try {
    console.log('[MIGRATE-DB] Début de la migration de la base de données');

    // Ajouter la colonne specialty si elle n'existe pas
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "specialty" TEXT
    `);
    console.log('[MIGRATE-DB] Colonne specialty ajoutée');

    // Ajouter la colonne vendorId à la table Request
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Request"
      ADD COLUMN IF NOT EXISTS "vendorId" TEXT
    `);
    console.log('[MIGRATE-DB] Colonne vendorId ajoutée');

    // Créer les index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Request_vendorId_idx" ON "Request"("vendorId")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Request_type_idx" ON "Request"("type")
    `);
    console.log('[MIGRATE-DB] Index créés');

    console.log('[MIGRATE-DB] Migration terminée avec succès');

    return NextResponse.json({
      success: true,
      message: 'Migrations appliquées avec succès',
    });
  } catch (error) {
    console.error('[MIGRATE-DB] Erreur lors de la migration:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la migration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
