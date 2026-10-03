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
  if (fs.existsSync(migrationsFolder)) {
    migrate(db, { migrationsFolder });
  } else {
    console.warn(`[DB] Migrations folder not found at: ${migrationsFolder}`);
  }
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

export function initDb(options: InitDbOptions = {}): BetterSQLite3Database<typeof schema> {
  const dbPath = options.path || getDbPath();

  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const sqlite = new Database(dbPath, { timeout: 5000 });
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('busy_timeout = 5000');

  const db = drizzle(sqlite, { schema });

  if (options.autoMigrate ?? true) {
    runMigrations(db);
  }

  if (options.setAsDefault) {
    setDbInstance(db, sqlite);
  }

  return db;
}

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (!dbInstance) {
    const dbPath = getDbPath();
    if (dbPath !== ':memory:') {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    sqliteInstance = new Database(dbPath, { timeout: 5000 });
    sqliteInstance.pragma('journal_mode = WAL');
    sqliteInstance.pragma('busy_timeout = 5000');

    dbInstance = drizzle(sqliteInstance, { schema });
    runMigrations(dbInstance);
  }

  return dbInstance;
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
