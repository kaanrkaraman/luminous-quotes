import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "../src/db";
import { quotes, savedQuotes } from "../src/db/schema";

const PORT = parseInt(process.env.PORT || "4000", 10);

const app = new Hono();

app.use("/*", cors());

app.get("/api/saved-quotes", async (c) => {
  const all = await db.select().from(savedQuotes).orderBy(savedQuotes.createdAt);
  return c.json(all);
});

app.get("/api/proxy-image", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.json({ error: "Missing url param" }, 400);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();

    return c.body(arrayBuffer, 200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return c.json({ error: "Failed to proxy image" }, 500);
  }
});

app.post("/api/saved-quotes", async (c) => {
  const body = await c.req.json();

  if (!body.quoteText || !body.quoteAuthor || !body.backgroundUrl || !body.fontFamily) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const result = await db
    .insert(savedQuotes)
    .values({
      quoteText: body.quoteText,
      quoteAuthor: body.quoteAuthor,
      backgroundUrl: body.backgroundUrl,
      fontFamily: body.fontFamily,
    })
    .returning();
  return c.json(result[0], 201);
});

app.patch("/api/saved-quotes/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const body = await c.req.json();

  const updates: Record<string, string> = {};
  if (body.backgroundUrl) updates.backgroundUrl = body.backgroundUrl;
  if (body.fontFamily) updates.fontFamily = body.fontFamily;

  const result = await db
    .update(savedQuotes)
    .set(updates)
    .where(eq(savedQuotes.id, id))
    .returning();
  return c.json(result[0]);
});

app.delete("/api/saved-quotes/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  await db.delete(savedQuotes).where(eq(savedQuotes.id, id));
  return c.json({ success: true });
});

const HARDCODED_FALLBACK_QUOTES = [
  { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
  { q: "In the middle of difficulty lies opportunity.", a: "Albert Einstein" },
  { q: "Simplicity is the ultimate sophistication.", a: "Leonardo da Vinci" },
  {
    q: "The future belongs to those who believe in the beauty of their dreams.",
    a: "Eleanor Roosevelt",
  },
  { q: "Who dares wins", a: "Sir David Stirling" },
];

async function saveQuoteToDb(quoteText: string, quoteAuthor: string) {
  try {
    const existing = await db
      .select()
      .from(quotes)
      .where(and(eq(quotes.quoteText, quoteText), eq(quotes.quoteAuthor, quoteAuthor)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(quotes).values({ quoteText, quoteAuthor });
      console.log("Saved new quote:", `${quoteText.substring(0, 40)}...`);
    }
  } catch (error) {
    console.error("Failed to save quote:", error);
  }
}

async function getRandomQuoteFromDb() {
  try {
    const all = await db.select().from(quotes);
    if (all.length > 0) {
      const random = all[Math.floor(Math.random() * all.length)];
      return { q: random.quoteText, a: random.quoteAuthor };
    }
  } catch (error) {
    console.error("Failed to get quote from db:", error);
  }
  return null;
}

app.get("/api/quotes", async (c) => {
  const cursor = c.req.query("cursor");
  const limitParam = c.req.query("limit");
  const limit = Math.min(parseInt(limitParam || "20", 10), 50);

  const allQuotes = await db.select().from(quotes).orderBy(quotes.id);

  if (cursor) {
    const cursorId = parseInt(cursor, 10);
    const cursorIndex = allQuotes.findIndex((q) => q.id === cursorId);
    const startIndex = cursorIndex + 1;
    const results = allQuotes.slice(startIndex, startIndex + limit + 1);
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    return c.json({ quotes: data, nextCursor, hasMore });
  }

  const results = allQuotes.slice(0, limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

  return c.json({ quotes: data, nextCursor, hasMore });
});

app.get("/api/quotes/count", async (c) => {
  const result = await db.select().from(quotes);
  return c.json({ count: result.length });
});

app.get("/api/quotes/random", async (c) => {
  try {
    const response = await fetch("https://zenquotes.io/api/random");
    if (!response.ok) throw new Error("ZenQuotes failed");
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      saveQuoteToDb(data[0].q, data[0].a);
      return c.json([{ ...data[0], source: "zenquotes" }]);
    }
    throw new Error("Invalid ZenQuotes format");
  } catch (error) {
    console.error("ZenQuotes failed, trying local quotes:", error);
  }

  const dbQuote = await getRandomQuoteFromDb();
  if (dbQuote) {
    console.log("Using quote from database");
    return c.json([{ ...dbQuote, source: "database" }]);
  }

  console.log("Using hardcoded fallback");
  const randomFallback =
    HARDCODED_FALLBACK_QUOTES[Math.floor(Math.random() * HARDCODED_FALLBACK_QUOTES.length)];
  return c.json([{ ...randomFallback, source: "fallback" }]);
});

export default {
  port: PORT,
  fetch: app.fetch,
};
