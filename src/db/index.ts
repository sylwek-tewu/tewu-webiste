import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import fs from 'node:fs';
import path from 'node:path';
import * as schema from './schema';

let dbInstance: BetterSQLite3Database<typeof schema> | null = null;
let sqliteInstance: Database.Database | null = null;

export function getDbPath(): string {
  if (process.env.OUTBOX_DB_PATH) {
    return process.env.OUTBOX_DB_PATH;
  }
  return path.join(process.cwd(), 'data', 'outbox.db');
}

export function getMigrationsFolder(): string {
  if (process.env.DRIZZLE_MIGRATIONS_DIR) {
    return process.env.DRIZZLE_MIGRATIONS_DIR;
  }
  return path.resolve(process.cwd(), 'drizzle');
}

export function runMigrations(
  db: BetterSQLite3Database<typeof schema>,
  migrationsFolder = getMigrationsFolder()
): void {
  // Without migrations the database has no tables and every outbox write fails, so stop here.
  if (!fs.existsSync(migrationsFolder)) {
    throw new Error(`[DB] Migrations folder not found at: ${migrationsFolder}`);
  }
  migrate(db, { migrationsFolder });
}

export interface InitDbOptions {
  path?: string;
  autoMigrate?: boolean;
  setAsDefault?: boolean;
}

export function setDbInstance(
  db: BetterSQLite3Database<typeof schema> | null,
  sqlite?: Database.Database | null
): void {
  if (sqliteInstance && sqliteInstance !== sqlite) {
    try {
      sqliteInstance.close();
    } catch {
      // ignore
    }
  }
  dbInstance = db;
  sqliteInstance = sqlite ?? null;
}

// better-sqlite3 is synchronous, so a locked database (two containers sharing the volume during a
// deploy) blocks the event loop for this long; keep it under DELIVERY_BUDGET.outboxMs.
const BUSY_TIMEOUT_MS = 1500;

export function initDb(options: InitDbOptions = {}): BetterSQLite3Database<typeof schema> {
  const dbPath = options.path || getDbPath();

  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const sqlite = new Database(dbPath, { timeout: BUSY_TIMEOUT_MS });
  try {
    sqlite.pragma('journal_mode = WAL');
    // The privacy policy says a delivered request is deleted for good: overwrite deleted rows with
    // zeros instead of leaving them in free pages, and shrink the WAL (which still holds the old
    // page images) back to zero once it has been checkpointed.
    sqlite.pragma('secure_delete = ON');
    sqlite.pragma('journal_size_limit = 0');
    const db = drizzle(sqlite, { schema });
    if (options.autoMigrate ?? true) {
      runMigrations(db);
    }
    // Only a migrated database becomes the default, so a failed migration is retried on the next call.
    if (options.setAsDefault) {
      setDbInstance(db, sqlite);
    }
    return db;
  } catch (error) {
    sqlite.close();
    throw error;
  }
}

export function getDb(): BetterSQLite3Database<typeof schema> {
  return dbInstance ?? initDb({ setAsDefault: true });
}

/** For testing purposes: resets singleton database connection */
export function resetDbInstance(): void {
  if (sqliteInstance) {
    try {
      sqliteInstance.close();
    } catch {
      // ignore
    }
  }
  sqliteInstance = null;
  dbInstance = null;
}

export { schema };
