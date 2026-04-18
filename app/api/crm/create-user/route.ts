import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encryptPassword } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  // Vérifier la clé API
  const apiKey = request.headers.get('X-API-Key');
  const expectedKey = process.env.CRM_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      role,
      password,
      referentEmail,
      token_rgpd,
      lien_rgpd,
      zoho_password,
      phone,
      courtierNumber,
    } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'email, password et role sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Utilisateur déjà existant', userId: existing.id },
        { status: 409 }
      );
    }

    // Trouver le référent si spécifié
    let referentId: string | undefined;
    if (referentEmail) {
      const referent = await prisma.user.findUnique({
        where: { email: referentEmail },
      });
      if (referent) {
        referentId = referent.id;
      }
    }

    // Résoudre courtierNumber unique
    let finalCourtierNumber: number | undefined;
    if (courtierNumber) {
      const num = parseInt(courtierNumber);
      const existing = await prisma.user.findUnique({ where: { courtierNumber: num } });
      if (existing) {
        // Numéro pris → trouver le max + 1
        const maxUser = await prisma.user.findFirst({
          where: { courtierNumber: { not: null } },
          orderBy: { courtierNumber: 'desc' },
        });
        finalCourtierNumber = (maxUser?.courtierNumber || 0) + 1;
        console.log(`⚠️ courtierNumber ${num} pris → attribué ${finalCourtierNumber}`);
      } else {
        finalCourtierNumber = num;
      }
    }

    // Créer l'utilisateur
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        passwordHash,
        role: role.toUpperCase(),
        referentId,
        courtierNumber: finalCourtierNumber,
        isActive: true,
      },
    });

    // Créer les identifiants RGPD si fournis
    if (lien_rgpd) {
      await prisma.credential.create({
        data: {
          userId: user.id,
          serviceName: 'RGPD',
          login: lien_rgpd,
          passwordEncrypted: encryptPassword(token_rgpd || ''),
        },
      });
    }

    // Créer les identifiants Zoho si fournis
    if (zoho_password) {
      await prisma.credential.create({
        data: {
          userId: user.id,
          serviceName: 'Zoho Mail',
          login: email,
          passwordEncrypted: encryptPassword(zoho_password),
        },
      });
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
    });
  } catch (error: any) {
    console.error('CREATE USER ERROR:', error);
    console.error('ERROR MESSAGE:', error.message);
    console.error('ERROR CODE:', error.code);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
