import type { CallbackLead } from '@/lib/callback/types';

export interface OutboxRecord extends CallbackLead {
  attempts: number;
  lastAttemptAt?: string; // ISO string
}

export interface OutboxStore {
  /** Adds a new record; rejects if the id is already taken. */
  put(record: CallbackLead & Partial<Pick<OutboxRecord, 'attempts' | 'lastAttemptAt'>>): Promise<void>;
  /**
   * Records a delivery attempt (attempts + 1, lastAttemptAt = `at`) only while the record still has
   * `attempts`. Returns false when it is gone or another run claimed it first, so two overlapping
   * runs never send the same record.
   */
  claim(id: string, attempts: number, at: string): Promise<boolean>;
  get(id: string): Promise<OutboxRecord | null>;
  /** Keys only, so one unreadable record cannot block the others. */
  listIds(): Promise<string[]>;
  delete(id: string): Promise<void>;
  getMeta(key: string): Promise<string | null>;
  setMeta(key: string, value: string): Promise<void>;
}

export interface ProcessResult {
  /** All record ids listed in this run, whatever happened to them. */
  processed: number;
  succeeded: number;
  failed: number;
  expired: number;
  /** Not due yet because of retry backoff. */
  skipped: number;
  /** Could not be decrypted (e.g. encryption key changed) and was deleted. */
  corrupt: number;
  /** Store errors (read, write, delete); the record is left for the next run. */
  errors: number;
  /** OUTBOX_ENCRYPTION_KEY was missing: the run stopped and every record was kept. */
  keyMissing: boolean;
}
