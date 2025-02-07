import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const categories = pgTable(
  'categories',
  {
    id: serial('id').primaryKey(),
    label: varchar('label', { length: 255 }).notNull(),
    icon: text('icon').notNull(),
  },
  (categories) => [uniqueIndex('categories_label_unique').on(categories.label)]
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  phrases: many(phrases),
}));

export const phrases = pgTable('phrases', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  pinned: boolean('pinned').default(false),
});

export const phrasesRelations = relations(phrases, ({ one }) => ({
  category: one(categories, {
    fields: [phrases.categoryId],
    references: [categories.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Phrase = typeof phrases.$inferSelect;
export type NewPhrase = typeof phrases.$inferInsert;
