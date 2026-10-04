import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const outboxRecords = sqliteTable('outbox_records', {
  id: text('id').primaryKey(),
  phone: text('phone').notNull(),
  slot: text('slot').notNull(),
  topic: text('topic'),
  source: text('source').notNull(),
  locale: text('locale').notNull(),
  createdAt: text('created_at').notNull(),
  attempts: integer('attempts').notNull().default(1),
  lastAttemptAt: text('last_attempt_at'),
});

export const outboxMeta = sqliteTable('outbox_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type OutboxRecordRow = typeof outboxRecords.$inferSelect;
export type InsertOutboxRecordRow = typeof outboxRecords.$inferInsert;
export type OutboxMetaRow = typeof outboxMeta.$inferSelect;
export type InsertOutboxMetaRow = typeof outboxMeta.$inferInsert;
