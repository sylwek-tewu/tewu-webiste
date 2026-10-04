import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runOutboxProcessing, resetCoordinatorMutex } from './coordinator';
import { MemoryOutboxStore } from './store';
import { resetRunAlertMemory } from './run-alerts';

describe('runOutboxProcessing', () => {
  let store: MemoryOutboxStore;
  const baseNow = new Date('2026-10-05T12:00:00Z');

  beforeEach(() => {
    resetCoordinatorMutex();
    resetRunAlertMemory();
    store = new MemoryOutboxStore();
    store.clear();
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', 'default-test-secret-key-123456');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetCoordinatorMutex();
    resetRunAlertMemory();
  });

  it('1. In-process mutex prevents concurrent runs (status: skipped)', async () => {
    await store.put({
      id: 'REC-MUTEX-1',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      locale: 'pl',
      createdAt: baseNow.toISOString(),
      attempts: 1,
    });

    let releaseEmail!: (val: boolean) => void;
    const sendEmail = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          releaseEmail = resolve;
        })
    );
    const sendAlert = vi.fn().mockResolvedValue(true);

    const firstRunPromise = runOutboxProcessing({
      store,
      sendEmail,
      sendAlert,
      now: () => baseNow,
    });

    // Wait until sendEmail has been entered by the first run
    await vi.waitFor(() => expect(sendEmail).toHaveBeenCalledOnce());

    // Attempt second run while first is in progress
    const secondRunResult = await runOutboxProcessing({
      store,
      sendEmail,
      sendAlert,
      now: () => baseNow,
    });

    expect(secondRunResult).toEqual({
      status: 'skipped',
      reason: 'run-in-progress',
    });

    // Release the first run and verify completion
    releaseEmail(true);
    const firstRunResult = await firstRunPromise;

    expect(firstRunResult).toMatchObject({
      processed: 1,
      succeeded: 1,
    });

    // Mutex should be released now; third run can proceed
    const thirdRunResult = await runOutboxProcessing({
      store,
      sendEmail,
      sendAlert,
      now: () => baseNow,
    });
    expect(thirdRunResult).toMatchObject({
      processed: 0,
      succeeded: 0,
    });
  });

  it('2. Succeeded delivery deletes record from store', async () => {
    await store.put({
      id: 'REC-SUCCESS-1',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      locale: 'pl',
      createdAt: baseNow.toISOString(),
      attempts: 1,
    });

    const sendEmail = vi.fn().mockResolvedValue(true);
    const sendAlert = vi.fn().mockResolvedValue(true);

    const result = await runOutboxProcessing({
      store,
      sendEmail,
      sendAlert,
      now: () => baseNow,
    });

    expect(result).toEqual({
      processed: 1,
      succeeded: 1,
      failed: 0,
      expired: 0,
      skipped: 0,
      corrupt: 0,
      errors: 0,
      keyMissing: false,
    });

    expect(sendEmail).toHaveBeenCalledOnce();
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'REC-SUCCESS-1',
        phone: '+48501482555',
      })
    );
    expect(await store.get('REC-SUCCESS-1')).toBeNull();
    expect(sendAlert).not.toHaveBeenCalled();
  });

  it('3. Expired record (> TTL) deletes record and triggers expiration alert', async () => {
    const expiredCreatedAt = new Date(baseNow.getTime() - 80 * 60 * 60 * 1000).toISOString();
    await store.put({
      id: 'REC-EXP-1',
      phone: '+48501482555',
      slot: 'asap',
      source: 'contact',
      locale: 'pl',
      createdAt: expiredCreatedAt,
      attempts: 3,
    });

    const sendEmail = vi.fn().mockResolvedValue(true);
    const sendAlert = vi.fn().mockResolvedValue(true);

    const result = await runOutboxProcessing({
      store,
      sendEmail,
      sendAlert,
      ttlHours: 72,
      now: () => baseNow,
    });

    expect(result).toMatchObject({
      processed: 1,
      expired: 1,
      succeeded: 0,
    });

    expect(sendEmail).not.toHaveBeenCalled();
    expect(await store.get('REC-EXP-1')).toBeNull();
    expect(sendAlert).toHaveBeenCalledOnce();
    expect(sendAlert).toHaveBeenCalledWith(
      expect.stringMatching(/Zgłoszenie #REC-EXP-1 wygasło po przekroczeniu czasu retencji \(72h\)/)
    );
  });

  it('4. Corrupt record deletes record and triggers corruption alert', async () => {
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', 'initial-key');
    await store.put({
      id: 'REC-CORRUPT-1',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      locale: 'pl',
      createdAt: baseNow.toISOString(),
      attempts: 1,
    });

    // Change encryption key to render ciphertext unreadable
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', 'different-key');

    const sendEmail = vi.fn().mockResolvedValue(true);
    const sendAlert = vi.fn().mockResolvedValue(true);

    const result = await runOutboxProcessing({
      store,
      sendEmail,
      sendAlert,
      now: () => baseNow,
    });

    expect(result).toMatchObject({
      processed: 1,
      corrupt: 1,
      succeeded: 0,
    });

    expect(sendEmail).not.toHaveBeenCalled();
    expect(await store.listIds()).toEqual([]);
    expect(sendAlert).toHaveBeenCalledOnce();
    expect(sendAlert).toHaveBeenCalledWith(
      expect.stringMatching(/Zgłoszenie #REC-CORRUPT-1 w buforze awaryjnym nie dało się odczytać/)
    );
  });

  it('5. Missing key triggers rate-limited alert', async () => {
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', 'initial-key');
    await store.put({
      id: 'REC-KEYMISS-1',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      locale: 'pl',
      createdAt: baseNow.toISOString(),
      attempts: 1,
    });

    // Unset encryption key
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', '');

    const sendEmail = vi.fn().mockResolvedValue(true);
    const sendAlert = vi.fn().mockResolvedValue(true);

    const result = await runOutboxProcessing({
      store,
      sendEmail,
      sendAlert,
      now: () => baseNow,
    });

    expect(result).toMatchObject({
      processed: 1,
      keyMissing: true,
      succeeded: 0,
      corrupt: 0,
    });

    expect(sendAlert).toHaveBeenCalledOnce();
    expect(sendAlert).toHaveBeenCalledWith(
      expect.stringMatching(/brak OUTBOX_ENCRYPTION_KEY w środowisku serwera/)
    );

    // Record remains in store
    expect(await store.listIds()).toEqual(['REC-KEYMISS-1']);

    // Second run at same time is rate limited (no duplicate alert)
    await runOutboxProcessing({
      store,
      sendEmail,
      sendAlert,
      now: () => baseNow,
    });
    expect(sendAlert).toHaveBeenCalledTimes(1);
  });

  it('6. Store errors trigger rate-limited alert', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await store.put({
      id: 'REC-ERR-1',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      locale: 'pl',
      createdAt: baseNow.toISOString(),
      attempts: 1,
    });

    vi.spyOn(store, 'get').mockRejectedValue(new Error('SQLITE_BUSY'));

    const sendEmail = vi.fn().mockResolvedValue(true);
    const sendAlert = vi.fn().mockResolvedValue(true);

    const result = await runOutboxProcessing({
      store,
      sendEmail,
      sendAlert,
      now: () => baseNow,
    });

    expect(result).toMatchObject({
      processed: 1,
      errors: 1,
      succeeded: 0,
    });

    expect(sendAlert).toHaveBeenCalledOnce();
    expect(sendAlert).toHaveBeenCalledWith(
      expect.stringMatching(/błędy bazy danych SQLite w ostatnim przebiegu \(liczba: 1\)/)
    );

    // Second run is rate limited
    await runOutboxProcessing({
      store,
      sendEmail,
      sendAlert,
      now: () => baseNow,
    });
    expect(sendAlert).toHaveBeenCalledTimes(1);
  });

  it('7. Database crash during run triggers fatal alert', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(store, 'listIds').mockRejectedValue(new Error('SQLITE_CANTOPEN'));

    const sendEmail = vi.fn().mockResolvedValue(true);
    const sendAlert = vi.fn().mockResolvedValue(true);

    await expect(
      runOutboxProcessing({
        store,
        sendEmail,
        sendAlert,
        now: () => baseNow,
      })
    ).rejects.toThrow('SQLITE_CANTOPEN');

    expect(sendAlert).toHaveBeenCalledOnce();
    expect(sendAlert).toHaveBeenCalledWith(
      expect.stringMatching(/przebieg ponawiania nie powiódł się \(baza SQLite niedostępna\?\)/)
    );

    // Mutex was unlocked in finally
    vi.spyOn(store, 'listIds').mockResolvedValue([]);
    const recoveryResult = await runOutboxProcessing({
      store,
      sendEmail,
      sendAlert,
      now: () => baseNow,
    });
    expect(recoveryResult).toMatchObject({
      processed: 0,
      succeeded: 0,
    });
  });

  it('8. Expiration alert failure is caught, logged, and does not block processing', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const expiredCreatedAt = new Date(baseNow.getTime() - 80 * 60 * 60 * 1000).toISOString();

    await store.put({
      id: 'REC-EXP-FAIL',
      phone: '+48501482555',
      slot: 'asap',
      source: 'contact',
      locale: 'pl',
      createdAt: expiredCreatedAt,
      attempts: 3,
    });

    await store.put({
      id: 'REC-VALID-1',
      phone: '+48501482555',
      slot: 'asap',
      source: 'contact',
      locale: 'pl',
      createdAt: baseNow.toISOString(),
      attempts: 1,
    });

    const sendEmail = vi.fn().mockResolvedValue(true);
    const sendAlert = vi.fn().mockRejectedValue(new Error('Telegram network error'));

    const result = await runOutboxProcessing({
      store,
      sendEmail,
      sendAlert,
      ttlHours: 72,
      now: () => baseNow,
    });

    expect(result).toMatchObject({
      processed: 2,
      expired: 1,
      succeeded: 1,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Outbox Coordinator] Failed to dispatch expiration alert for #REC-EXP-FAIL:'),
      expect.any(Error)
    );
    expect(sendEmail).toHaveBeenCalledOnce();
    expect(await store.get('REC-EXP-FAIL')).toBeNull();
    expect(await store.get('REC-VALID-1')).toBeNull();
  });

  it('9. Corruption alert failure is caught, logged, and does not block processing', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', 'initial-key');

    await store.put({
      id: 'REC-CORRUPT-FAIL',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      locale: 'pl',
      createdAt: baseNow.toISOString(),
      attempts: 1,
    });

    // Change encryption key to render ciphertext unreadable
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', 'different-key');

    const sendEmail = vi.fn().mockResolvedValue(true);
    const sendAlert = vi.fn().mockRejectedValue(new Error('Telegram timeout'));

    const result = await runOutboxProcessing({
      store,
      sendEmail,
      sendAlert,
      now: () => baseNow,
    });

    expect(result).toMatchObject({
      processed: 1,
      corrupt: 1,
      succeeded: 0,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Outbox Coordinator] Failed to dispatch corruption alert for #REC-CORRUPT-FAIL:'),
      expect.any(Error)
    );
    expect(await store.listIds()).toEqual([]);
  });
});
