import { google } from 'googleapis';
import { Readable } from 'stream';

const SHARED_DRIVE_ID = '0ACKaJQqRlmwgUk9PVA';
const AUDIO_FOLDER_NAME = 'AUDIOS FORMATION';

function getDriveService() {
  const credsBase64 = process.env.GOOGLE_DRIVE_CREDS_BASE64;
  if (!credsBase64) {
    throw new Error('GOOGLE_DRIVE_CREDS_BASE64 non défini');
  }
  const creds = JSON.parse(Buffer.from(credsBase64, 'base64').toString());
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

async function getOrCreateAudioFolder(): Promise<string> {
  const drive = getDriveService();

  // Chercher le dossier existant
  const res = await drive.files.list({
    q: `name='${AUDIO_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    driveId: SHARED_DRIVE_ID,
    corpora: 'drive',
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    fields: 'files(id,name)',
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  // Créer le dossier
  const folder = await drive.files.create({
    requestBody: {
      name: AUDIO_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      driveId: SHARED_DRIVE_ID,
      parents: [SHARED_DRIVE_ID],
    },
    supportsAllDrives: true,
    fields: 'id',
  });

  console.log(`📁 Dossier "${AUDIO_FOLDER_NAME}" créé:`, folder.data.id);
  return folder.data.id!;
}

export async function uploadAudioToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ fileId: string; webViewLink: string }> {
  const drive = getDriveService();
  const folderId = await getOrCreateAudioFolder();

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const file = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
      driveId: SHARED_DRIVE_ID,
    },
    media: {
      mimeType,
      body: stream,
    },
    supportsAllDrives: true,
    fields: 'id,webViewLink',
  });

  // Rendre accessible en lecture
  await drive.permissions.create({
    fileId: file.data.id!,
    supportsAllDrives: true,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  const webViewLink = `https://drive.google.com/file/d/${file.data.id}/view`;
  console.log(`🎵 Audio uploadé: ${filename} → ${file.data.id}`);

  return { fileId: file.data.id!, webViewLink };
}

export async function deleteAudioFromDrive(fileId: string): Promise<void> {
  const drive = getDriveService();
  await drive.files.delete({ fileId, supportsAllDrives: true });
  console.log(`🗑 Audio supprimé du Drive: ${fileId}`);
}
