import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ⚠️ ENDPOINT DE DEBUG - À SUPPRIMER APRÈS DIAGNOSTIC
// Cet endpoint permet de vérifier l'état de la base de données
export async function GET() {
  try {
    // Compter le nombre total d'utilisateurs
    const totalUsers = await prisma.user.count();

    // Vérifier si l'admin existe (sans specialty car peut ne pas exister en prod)
    const adminUser = await prisma.user.findUnique({
      where: { email: 'sabir.bahloul@liliwatt.fr' },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        // Ne pas exposer le hash pour la sécurité, mais vérifier qu'il existe
        passwordHash: true,
      },
    });

    // Vérifier tous les admins
    const allAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      totalUsers,
      adminExists: !!adminUser,
      adminDetails: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive,
        createdAt: adminUser.createdAt,
        hasPasswordHash: !!adminUser.passwordHash,
        passwordHashLength: adminUser.passwordHash?.length || 0,
      } : null,
      allAdmins,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur debug-auth:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la vérification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
