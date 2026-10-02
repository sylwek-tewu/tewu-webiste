export interface OutboxRecord {
  id: string; // Random 6-character hex ID (e.g. 'C9F1A2'), never a phone number
  phone: string; // Plaintext in this object; encrypted at rest by the store
  slot: string; // 'asap' | '8-12' | '12-16' | '17-18'
  topic?: string;
  source: string; // 'header' | 'floating' | 'contact' | 'hero' | etc.
  createdAt: string; // ISO string
  attempts: number;
  lastAttemptAt?: string; // ISO string
}

export interface OutboxStore {
  put(record: OutboxRecord): Promise<void>;
  get(id: string): Promise<OutboxRecord | null>;
  /** Keys only, so one unreadable record cannot block the others. */
  listIds(): Promise<string[]>;
  delete(id: string): Promise<void>;
}

export interface ProcessResult {
  processed: number;
  succeeded: number;
  failed: number;
  expired: number;
  /** Not due yet because of retry backoff. */
  skipped: number;
  /** Could not be read (e.g. encryption key changed) and was deleted. */
  corrupt: number;
}
