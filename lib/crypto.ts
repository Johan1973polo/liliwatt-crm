import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Dérive une clé de 32 bytes à partir de la clé de l'environnement
 */
function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  }

  // S'assurer que la clé fait exactement 32 caractères
  const paddedKey = key.padEnd(32, '0').substring(0, 32);
  return Buffer.from(paddedKey, 'utf8');
}

/**
 * Chiffre un mot de passe avec AES-256-GCM
 */
export function encryptPassword(password: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Déchiffre un mot de passe chiffré avec AES-256-GCM
 */
export function decryptPassword(encryptedPassword: string): string {
  const key = getKey();
  const parts = encryptedPassword.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted password format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Masque un mot de passe pour l'affichage
 */
export function maskPassword(password: string): string {
  return '•••••••••';
}
