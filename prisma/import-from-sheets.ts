import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import bcrypt from 'bcryptjs';
import { encryptPassword } from '../lib/crypto';

const prisma = new PrismaClient();

async function importUsers() {
  console.log('🔄 Import depuis Google Sheets MDP ZOHO...\n');

  // Auth Google Sheets
  const credsBase64 = process.env.GOOGLE_DRIVE_CREDS_BASE64;
  if (!credsBase64) {
    console.error('❌ GOOGLE_DRIVE_CREDS_BASE64 non défini');
    process.exit(1);
  }

  const creds = JSON.parse(Buffer.from(credsBase64, 'base64').toString());
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11gVGMBtqMUhPh70yjMgjW-yLDht6fO0KqWJAF53ASXk',
    range: 'A2:K100',
  });

  const rows = res.data.values || [];
  console.log(`📋 ${rows.length} lignes trouvées dans le Sheet\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  // Premier pass : créer les admins et référents d'abord
  const sortedRows = [...rows].sort((a, b) => {
    const roleA = (a[9] || 'vendeur').toLowerCase();
    const roleB = (b[9] || 'vendeur').toLowerCase();
    const order: Record<string, number> = { admin: 0, referent: 1, vendeur: 2 };
    return (order[roleA] ?? 2) - (order[roleB] ?? 2);
  });

  for (const row of sortedRows) {
    const nom = (row[0] || '').trim();
    const prenom = (row[1] || '').trim();
    const mdp = (row[2] || '').trim();
    const email = (row[3] || '').trim().toLowerCase();
    const titre = (row[4] || '').trim();
    const driveId = (row[5] || '').trim();
    const referentEmail = (row[6] || '').trim().toLowerCase();
    const token = (row[7] || '').trim();
    const lienRgpd = (row[8] || '').trim();
    const role = (row[9] || 'vendeur').trim().toLowerCase();
    const statut = (row[10] || 'actif').trim().toLowerCase();

    if (!email) {
      skipped++;
      continue;
    }

    // Vérifier si existe déjà
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`⏭️  ${email.padEnd(35)} — existe déjà (${existing.role})`);
      skipped++;
      continue;
    }

    // Mapper le rôle
    const crmRole =
      role === 'referent' ? 'REFERENT' : role === 'admin' ? 'ADMIN' : 'VENDEUR';

    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(mdp || 'Liliwatt2026@', 10);

    // Trouver le référent
    let referentId: string | null = null;
    if (referentEmail) {
      const referent = await prisma.user.findUnique({
        where: { email: referentEmail },
      });
      if (referent) {
        referentId = referent.id;
      } else {
        console.log(`   ⚠️  Référent ${referentEmail} non trouvé pour ${email}`);
      }
    }

    try {
      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email,
          firstName: prenom || null,
          lastName: nom || null,
          passwordHash,
          role: crmRole,
          referentId,
          isActive: statut !== 'bloqué' && statut !== 'inactif',
        },
      });

      // Créer credential Zoho Mail
      if (mdp) {
        await prisma.credential.create({
          data: {
            userId: user.id,
            serviceName: 'Zoho Mail',
            login: email,
            passwordEncrypted: encryptPassword(mdp),
          },
        });
      }

      // Créer credential RGPD
      if (lienRgpd) {
        await prisma.credential.create({
          data: {
            userId: user.id,
            serviceName: 'RGPD',
            login: lienRgpd,
            passwordEncrypted: encryptPassword(token || ''),
          },
        });
      }

      console.log(`✅  ${email.padEnd(35)} — ${crmRole.padEnd(10)} ${prenom} ${nom}`);
      created++;
    } catch (err: any) {
      console.log(`❌  ${email.padEnd(35)} — ERREUR: ${err.message?.substring(0, 80)}`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Import terminé !`);
  console.log(`   ✅ Créés : ${created}`);
  console.log(`   ⏭️  Ignorés : ${skipped}`);
  console.log(`   ❌ Erreurs : ${errors}`);
  console.log('='.repeat(60));

  // Afficher le résumé
  const allUsers = await prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { email: 'asc' }],
    select: { email: true, firstName: true, lastName: true, role: true, isActive: true },
  });
  console.log(`\n👥 Total utilisateurs en base : ${allUsers.length}`);
  allUsers.forEach((u) => {
    console.log(
      `   ${u.role.padEnd(10)} ${u.email.padEnd(35)} ${u.firstName || ''} ${u.lastName || ''} ${u.isActive ? '' : '(INACTIF)'}`
    );
  });

  await prisma.$disconnect();
}

importUsers().catch((err) => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
