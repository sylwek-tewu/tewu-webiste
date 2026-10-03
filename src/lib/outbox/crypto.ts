/**
 * AES-256-GCM Encryption utility for sensitive Outbox data at-rest.
 * Uses OUTBOX_ENCRYPTION_KEY environment variable.
 */

import crypto from 'crypto';

const PREFIX = 'enc:v1:';

/** OUTBOX_ENCRYPTION_KEY is not configured. A config problem: restoring the key makes records readable again. */
export class OutboxKeyMissingError extends Error {
  constructor() {
    super('Cannot decrypt outbox record: OUTBOX_ENCRYPTION_KEY is missing');
    this.name = 'OutboxKeyMissingError';
  }
}

/** The stored phone can never be decrypted with the configured key (wrong key, tampered or malformed payload). */
export class CorruptRecordError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'CorruptRecordError';
  }
}

function get32ByteKey(secret?: string): Buffer | null {
  const rawKey = secret !== undefined ? secret : process.env.OUTBOX_ENCRYPTION_KEY;
  if (!rawKey || rawKey.trim() === '') {
    return null;
  }
  // Create deterministic 32-byte key via SHA-256
  return crypto.createHash('sha256').update(rawKey).digest();
}

/**
 * Encrypts a phone number using AES-256-GCM.
 * Without OUTBOX_ENCRYPTION_KEY it throws in production (the privacy policy promises encryption),
 * and returns the plaintext phone elsewhere so local development works without a key.
 */
export function encryptPhone(phone: string, secret?: string): string {
  const key = get32ByteKey(secret);
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('OUTBOX_ENCRYPTION_KEY is not configured; refusing to store a phone number in plaintext');
    }
    return phone;
  }

  const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(phone, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a previously encrypted phone string.
 * If input is plaintext or does not have encryption prefix, returns input verbatim.
 */
export function decryptPhone(cipherText: string, secret?: string): string {
  if (!cipherText.startsWith(PREFIX)) {
    return cipherText;
  }

  const key = get32ByteKey(secret);
  if (!key) {
    throw new OutboxKeyMissingError();
  }

  const parts = cipherText.slice(PREFIX.length).split(':');
  if (parts.length !== 3) {
    throw new CorruptRecordError('Malformed encrypted phone payload');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    // Auth tag mismatch: wrong key or tampered data
    throw new CorruptRecordError('Outbox record failed authentication', { cause: error });
  }
}
