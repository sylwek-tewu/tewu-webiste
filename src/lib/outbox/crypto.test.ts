import { describe, it, expect } from 'vitest';
import { encryptPhone, decryptPhone } from './crypto';

describe('Outbox AES-256-GCM Crypto', () => {
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
    const tampered = cipherText.slice(0, -2) + 'aa';
    expect(() => decryptPhone(tampered, testSecret)).toThrow();
  });

  it('returns plaintext unchanged if no secret key is configured', () => {
    const plaintext = encryptPhone(samplePhone, '');
    expect(plaintext).toBe(samplePhone);

    const result = decryptPhone(plaintext, '');
    expect(result).toBe(samplePhone);
  });
});
