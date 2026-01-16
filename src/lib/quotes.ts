export interface Quote {
  content: string;
  author: string;
  source?: "zenquotes" | "database" | "fallback";
}

import { API_BASE } from "@/lib/config";

const FALLBACK_QUOTES: Quote[] = [
  {
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    source: "fallback",
  },
  {
    content: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    source: "fallback",
  },
  {
    content: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    source: "fallback",
  },
  {
    content: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    source: "fallback",
  },
  { content: "Who dares wins", author: "Sir David Stirling", source: "fallback" },
  {
    content: "If I have seen further than others, it is by standing on the shoulders of giants.",
    author: "Isaac Newton",
    source: "fallback",
  },
  {
    content:
      "There is nothing noble in being superior to some other man. The true nobility is in being superior to your former self.",
    author: "Ernest Hemingway",
    source: "fallback",
  },
];

export async function fetchRandomQuote(): Promise<Quote> {
  try {
    const response = await fetch(`${API_BASE}/api/quotes/random`);
    if (!response.ok) throw new Error("API unavailable");
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return { content: data[0].q, author: data[0].a, source: data[0].source || "zenquotes" };
    }
    throw new Error("Invalid response");
  } catch {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
}
