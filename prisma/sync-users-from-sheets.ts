import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import bcrypt from 'bcryptjs';
import { encryptPassword } from '../lib/crypto';

const prisma = new PrismaClient();

const SHEETS_ID = '11gVGMBtqMUhPh70yjMgjW-yLDht6fO0KqWJAF53ASXk';

async function sync() {
  console.log('🔄 Sync Sheets → Neon...\n');

  const credsBase64 = process.env.GOOGLE_DRIVE_CREDS_BASE64;
  let creds: any;
  if (credsBase64) {
    creds = JSON.parse(Buffer.from(credsBase64, 'base64').toString());
  } else {
    creds = require('/Users/strategyglobal/Desktop/liliwatt-website/liliwatt-analyseur/credentials.json');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEETS_ID,
    range: 'A2:K100',
  });

  const rows = res.data.values || [];
  console.log(`📋 ${rows.length} lignes dans le Sheet\n`);

  // Trier : admin → referent → vendeur (les référents doivent exister avant les vendeurs)
  const sorted = [...rows].sort((a, b) => {
    const roleA = (a[9] || 'vendeur').toLowerCase();
    const roleB = (b[9] || 'vendeur').toLowerCase();
    const order: Record<string, number> = { admin: 0, referent: 1, vendeur: 2 };
    return (order[roleA] ?? 2) - (order[roleB] ?? 2);
  });

  // Trouver le max courtierNumber existant
  const maxUser = await prisma.user.findFirst({
    where: { courtierNumber: { not: null } },
    orderBy: { courtierNumber: 'desc' },
  });
  let nextCourtier = (maxUser?.courtierNumber || 0) + 1;

  let created = 0, updated = 0, skipped = 0;

  for (const row of sorted) {
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

    if (!email || statut === 'supprime') {
      skipped++;
      continue;
    }

    const crmRole = role === 'referent' ? 'REFERENT' : role === 'admin' ? 'ADMIN' : 'VENDEUR';
    const isActive = statut !== 'inactif';

    // Trouver le référent
    let referentId: string | null = null;
    if (referentEmail) {
      const ref = await prisma.user.findUnique({ where: { email: referentEmail } });
      if (ref) referentId = ref.id;
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // Update
      await prisma.user.update({
        where: { email },
        data: {
          firstName: prenom || existing.firstName,
          lastName: nom || existing.lastName,
          role: crmRole,
          referentId: referentId || existing.referentId,
          isActive,
        },
      });

      // Update credentials
      if (mdp) {
        const zoho = await prisma.credential.findFirst({
          where: { userId: existing.id, serviceName: 'Zoho Mail' },
        });
        if (!zoho) {
          await prisma.credential.create({
            data: { userId: existing.id, serviceName: 'Zoho Mail', login: email, passwordEncrypted: encryptPassword(mdp) },
          });
        }
      }
      if (lienRgpd) {
        const rgpd = await prisma.credential.findFirst({
          where: { userId: existing.id, serviceName: 'RGPD' },
        });
        if (!rgpd) {
          await prisma.credential.create({
            data: { userId: existing.id, serviceName: 'RGPD', login: lienRgpd, passwordEncrypted: encryptPassword(token || '') },
          });
        }
      }

      console.log(`🔄  ${email.padEnd(35)} — MÀJ ${crmRole.padEnd(10)} ${isActive ? '' : '(INACTIF)'}`);
      updated++;
    } else {
      // Create
      const passwordHash = await bcrypt.hash(mdp || 'Liliwatt2026@', 10);
      const user = await prisma.user.create({
        data: {
          email,
          firstName: prenom || null,
          lastName: nom || null,
          passwordHash,
          role: crmRole,
          referentId,
          isActive,
          courtierNumber: nextCourtier,
        },
      });
      nextCourtier++;

      if (mdp) {
        await prisma.credential.create({
          data: { userId: user.id, serviceName: 'Zoho Mail', login: email, passwordEncrypted: encryptPassword(mdp) },
        });
      }
      if (lienRgpd) {
        await prisma.credential.create({
          data: { userId: user.id, serviceName: 'RGPD', login: lienRgpd, passwordEncrypted: encryptPassword(token || '') },
        });
      }

      console.log(`✅  ${email.padEnd(35)} — CRÉÉ ${crmRole.padEnd(10)} N°${user.courtierNumber}`);
      created++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Sync terminée : ${created} créés, ${updated} mis à jour, ${skipped} ignorés`);
  console.log('='.repeat(60));

  const all = await prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { email: 'asc' }],
    select: { email: true, firstName: true, lastName: true, role: true, isActive: true, courtierNumber: true },
  });
  console.log(`\n👥 Total en base : ${all.length}`);
  all.forEach(u => {
    console.log(`  N°${String(u.courtierNumber || '-').padEnd(4)} ${u.role.padEnd(10)} ${u.email.padEnd(35)} ${u.firstName || ''} ${u.lastName || ''} ${u.isActive ? '' : '(INACTIF)'}`);
  });

  await prisma.$disconnect();
}

sync().catch(e => { console.error('❌', e); process.exit(1); });
