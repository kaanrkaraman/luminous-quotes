import { useCallback, useEffect, useState } from "react"
import type { NewSavedQuote, SavedQuote } from "@/db/schema"
import { API_BASE } from "@/lib/config"

export function useSavedQuotes() {
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSavedQuotes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/saved-quotes`)
      const data = await response.json()
      setSavedQuotes(data)
    } catch (error) {
      console.error("Failed to fetch saved quotes:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSavedQuotes()
  }, [fetchSavedQuotes])

  const addSavedQuote = useCallback(async (quote: Omit<NewSavedQuote, "id" | "createdAt">) => {
    try {
      const response = await fetch(`${API_BASE}/api/saved-quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote),
      })
      const newQuote = await response.json()
      setSavedQuotes((prev) => [...prev, newQuote])
      return newQuote
    } catch (error) {
      console.error("Failed to save quote:", error)
      throw error
    }
  }, [])

  const updateSavedQuote = useCallback(
    async (id: number, updates: { backgroundUrl?: string; fontFamily?: string }) => {
      try {
        const response = await fetch(`${API_BASE}/api/saved-quotes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
        const updated = await response.json()
        setSavedQuotes((prev) => prev.map((q) => (q.id === id ? updated : q)))
        return updated
      } catch (error) {
        console.error("Failed to update saved quote:", error)
        throw error
      }
    },
    [],
  )

  const removeSavedQuote = useCallback(async (id: number) => {
    try {
      await fetch(`${API_BASE}/api/saved-quotes/${id}`, { method: "DELETE" })
      setSavedQuotes((prev) => prev.filter((q) => q.id !== id))
    } catch (error) {
      console.error("Failed to remove saved quote:", error)
      throw error
    }
  }, [])

  return {
    savedQuotes,
    isLoading,
    addSavedQuote,
    updateSavedQuote,
    removeSavedQuote,
    refetch: fetchSavedQuotes,
  }
}
