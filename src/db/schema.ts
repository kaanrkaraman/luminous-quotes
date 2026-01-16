import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const savedQuotes = sqliteTable("saved_quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quoteText: text("quote_text").notNull(),
  quoteAuthor: text("quote_author").notNull(),
  backgroundUrl: text("background_url").notNull(),
  fontFamily: text("font_family").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
})

export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quoteText: text("quote_text").notNull(),
  quoteAuthor: text("quote_author").notNull(),
  savedAt: integer("saved_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
})

export type SavedQuote = typeof savedQuotes.$inferSelect
export type NewSavedQuote = typeof savedQuotes.$inferInsert
export type Quote = typeof quotes.$inferSelect
export type NewQuote = typeof quotes.$inferInsert
