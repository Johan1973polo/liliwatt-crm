import { google } from 'googleapis';

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

/**
 * Crée une session d'upload resumable sur Google Drive.
 * Retourne l'URL vers laquelle le navigateur enverra le fichier directement.
 */
export async function createResumableUpload(
  filename: string,
  mimeType: string,
  fileSize: number
): Promise<{ uploadUrl: string; folderId: string }> {
  const credsBase64 = process.env.GOOGLE_DRIVE_CREDS_BASE64;
  if (!credsBase64) throw new Error('GOOGLE_DRIVE_CREDS_BASE64 non défini');
  const creds = JSON.parse(Buffer.from(credsBase64, 'base64').toString());

  // Obtenir un access token
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  const accessToken = await auth.getAccessToken();
  const folderId = await getOrCreateAudioFolder();

  // Initier un upload resumable via l'API REST directement
  const metadata = JSON.stringify({
    name: filename,
    parents: [folderId],
    driveId: SHARED_DRIVE_ID,
  });

  const initRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType,
        'X-Upload-Content-Length': String(fileSize),
      },
      body: metadata,
    }
  );

  if (!initRes.ok) {
    const err = await initRes.text();
    throw new Error(`Drive resumable init failed: ${initRes.status} ${err}`);
  }

  const uploadUrl = initRes.headers.get('location');
  if (!uploadUrl) throw new Error('No upload URL returned by Drive');

  console.log(`📤 Resumable upload initié: ${filename} (${(fileSize / 1024 / 1024).toFixed(1)} MB)`);
  return { uploadUrl, folderId };
}

/**
 * Après que le client a uploadé vers Drive, on finalise :
 * rend le fichier public en lecture et retourne les infos.
 */
export async function finalizeUpload(
  fileId: string
): Promise<{ webViewLink: string }> {
  const drive = getDriveService();

  await drive.permissions.create({
    fileId,
    supportsAllDrives: true,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  const webViewLink = `https://drive.google.com/file/d/${fileId}/view`;
  console.log(`✅ Audio finalisé: ${fileId}`);
  return { webViewLink };
}

export async function deleteAudioFromDrive(fileId: string): Promise<void> {
  const drive = getDriveService();
  await drive.files.delete({ fileId, supportsAllDrives: true });
  console.log(`🗑 Audio supprimé du Drive: ${fileId}`);
}
