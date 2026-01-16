import { useCallback, useEffect, useRef, useState } from "react";
import type { Quote } from "@/db/schema";
import { API_BASE } from "@/lib/config";

interface QuotesPage {
  quotes: Quote[];
  nextCursor: number | null;
  hasMore: boolean;
}

export function useQuotesLibrary() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const isLoadingRef = useRef(false);

  const fetchCount = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/quotes/count`);
      const data = await response.json();
      setTotal(data.count);
    } catch (error) {
      console.error("Failed to fetch quote count:", error);
    }
  }, []);

  const fetchPage = useCallback(async (cursor?: number | null) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const url = cursor
        ? `${API_BASE}/api/quotes?cursor=${cursor}&limit=20`
        : `${API_BASE}/api/quotes?limit=20`;
      const response = await fetch(url);
      const data: QuotesPage = await response.json();

      setQuotes((prev) => (cursor ? [...prev, ...data.quotes] : data.quotes));
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Failed to fetch quotes:", error);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingRef.current && nextCursor) {
      fetchPage(nextCursor);
    }
  }, [hasMore, nextCursor, fetchPage]);

  useEffect(() => {
    fetchPage();
    fetchCount();
  }, [fetchPage, fetchCount]);

  return {
    quotes,
    total,
    hasMore,
    isLoading,
    loadMore,
  };
}
