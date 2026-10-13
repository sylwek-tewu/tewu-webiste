import { describe, it, expect, vi, afterEach } from 'vitest';
import { encryptPhone, decryptPhone, CorruptRecordError, OutboxKeyMissingError } from './crypto';

describe('Outbox AES-256-GCM Crypto', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const testSecret = 'my-super-secret-encryption-key-for-test-12345';
  const samplePhone = '+48501482555';

  it('encrypts and successfully decrypts a phone number', () => {
    const cipherText = encryptPhone(samplePhone, testSecret);
    expect(cipherText).not.toBe(samplePhone);
    expect(cipherText.startsWith('enc:v1:')).toBe(true);

    const decrypted = decryptPhone(cipherText, testSecret);
    expect(decrypted).toBe(samplePhone);
  });

  it('generates different ciphertexts for the same plaintext due to random IV', () => {
    const cipherText1 = encryptPhone(samplePhone, testSecret);
    const cipherText2 = encryptPhone(samplePhone, testSecret);
    expect(cipherText1).not.toBe(cipherText2);

    expect(decryptPhone(cipherText1, testSecret)).toBe(samplePhone);
    expect(decryptPhone(cipherText2, testSecret)).toBe(samplePhone);
  });

  it('fails decryption if wrong key is used', () => {
    const cipherText = encryptPhone(samplePhone, testSecret);
    expect(() => decryptPhone(cipherText, 'completely-different-key')).toThrow();
  });

  it('fails decryption if ciphertext is tampered with', () => {
    const cipherText = encryptPhone(samplePhone, testSecret);
    const last = cipherText.slice(-2);
    const tampered = cipherText.slice(0, -2) + (last === 'aa' ? 'bb' : 'aa');
    expect(() => decryptPhone(tampered, testSecret)).toThrow();
  });

  it('returns plaintext unchanged outside production if no secret key is configured', () => {
    const plaintext = encryptPhone(samplePhone, '');
    expect(plaintext).toBe(samplePhone);

    const result = decryptPhone(plaintext, '');
    expect(result).toBe(samplePhone);
  });

  it('refuses to store plaintext in production when no key is configured', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => encryptPhone(samplePhone, '')).toThrow(/OUTBOX_ENCRYPTION_KEY/);
  });

  describe('error classification (decides whether the outbox may delete a record)', () => {
    it('reports a wrong key or tampered data as a corrupt record', () => {
      const cipherText = encryptPhone(samplePhone, testSecret);
      expect(() => decryptPhone(cipherText, 'completely-different-key')).toThrow(CorruptRecordError);
      const last = cipherText.slice(-2);
      expect(() => decryptPhone(cipherText.slice(0, -2) + (last === 'aa' ? 'bb' : 'aa'), testSecret)).toThrow(CorruptRecordError);
    });

    it('reports a malformed payload as a corrupt record', () => {
      expect(() => decryptPhone('enc:v1:not-three-parts', testSecret)).toThrow(CorruptRecordError);
    });

    it('reports a missing key as a configuration problem, not corruption (restoring the key recovers the data)', () => {
      const cipherText = encryptPhone(samplePhone, testSecret);
      expect(() => decryptPhone(cipherText, '')).toThrow(OutboxKeyMissingError);
      expect(() => decryptPhone(cipherText, '')).not.toThrow(CorruptRecordError);
    });
  });
});
