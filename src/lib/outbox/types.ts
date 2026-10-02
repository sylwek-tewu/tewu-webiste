export interface OutboxRecord {
  id: string; // Random short ID (e.g. 'A7K2' or 'c9f1a2'), never a phone number
  phone: string; // Plaintext when in memory, optionally encrypted at-rest in Blobs
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
  list(): Promise<OutboxRecord[]>;
  delete(id: string): Promise<void>;
}

export interface ProcessResult {
  processed: number;
  succeeded: number;
  failed: number;
  expired: number;
}
