import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// ⚠️ ENDPOINT TEMPORAIRE - À SUPPRIMER APRÈS UTILISATION
// Cet endpoint permet d'initialiser la base de données en production
export async function POST() {
  try {
    console.log('[INIT-DB] Début de l\'initialisation de la base de données');

    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log('[INIT-DB] Admin déjà existant:', existingAdmin.email);
      return NextResponse.json(
        {
          error: 'Base de données déjà initialisée',
          existingAdmin: {
            email: existingAdmin.email,
            isActive: existingAdmin.isActive,
          },
        },
        { status: 400 }
      );
    }

    console.log('[INIT-DB] Création du hash du mot de passe');
    // Créer l'admin principal
    const adminPasswordHash = await bcrypt.hash('LILIWATT2023@', 10);
    console.log('[INIT-DB] Hash créé, longueur:', adminPasswordHash.length);

    console.log('[INIT-DB] Création de l\'utilisateur admin');
    const admin = await prisma.user.create({
      data: {
        email: 'sabir.bahloul@liliwatt.fr',
        phone: null,
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log('[INIT-DB] Admin créé avec succès:', admin.id);

    // Créer le lien global
    console.log('[INIT-DB] Création du lien global');
    await prisma.link.create({
      data: {
        scope: 'GLOBAL',
        title: 'LILIWATT FACTURATION',
        url: 'https://dashing-croissant-127a00.netlify.app/',
        order: 1,
      },
    });
    console.log('[INIT-DB] Lien global créé');

    console.log('[INIT-DB] Initialisation terminée avec succès');
    return NextResponse.json({
      success: true,
      message: 'Base de données initialisée avec succès',
      admin: {
        id: admin.id,
        email: admin.email,
        password: 'LILIWATT2023@',
        isActive: admin.isActive,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('[INIT-DB] Erreur lors de l\'initialisation:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'initialisation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
