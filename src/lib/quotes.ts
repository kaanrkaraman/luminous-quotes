export interface Quote {
  content: string
  author: string
}

import { API_BASE } from "@/lib/config"

const FALLBACK_QUOTES: Quote[] = [
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { content: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { content: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  {
    content: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  { content: "Who dares wins", author: "Sir David Stirling" },
  {
    content: "If I have seen further than others, it is by standing on the shoulders of giants.",
    author: "Isaac Newton",
  },
  {
    content:
      "There is nothing noble in being superior to some other man. The true nobility is in being superior to your former self.",
    author: "Ernest Hemingway",
  },
]

export async function fetchRandomQuote(): Promise<Quote> {
  try {
    const response = await fetch(`${API_BASE}/api/quotes/random`)
    if (!response.ok) throw new Error("API unavailable")
    const data = await response.json()
    if (Array.isArray(data) && data.length > 0) {
      return { content: data[0].q, author: data[0].a }
    }
    throw new Error("Invalid response")
  } catch {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
  }
}
