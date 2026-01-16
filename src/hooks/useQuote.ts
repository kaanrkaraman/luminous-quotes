import { useCallback, useEffect, useState } from "react";
import type { Settings } from "@/hooks/useSettings";
import { fetchRandomQuote, type Quote } from "@/lib/quotes";
import { fetchRandomBackground, type UnsplashPhoto } from "@/lib/unsplash";

export const FONTS = [
  { name: "Satoshi", value: "'Satoshi', sans-serif", category: "sans" },
  { name: "Cabinet Grotesk", value: "'Cabinet Grotesk', sans-serif", category: "sans" },
  { name: "Clash Display", value: "'Clash Display', sans-serif", category: "display" },
  { name: "General Sans", value: "'General Sans', sans-serif", category: "sans" },
  { name: "Panchang", value: "'Panchang', sans-serif", category: "display" },
  { name: "Ranade", value: "'Ranade', sans-serif", category: "sans" },
  { name: "Zodiak", value: "'Zodiak', serif", category: "serif" },
  { name: "Boska", value: "'Boska', serif", category: "serif" },
  { name: "Telma", value: "'Telma', serif", category: "display" },
  { name: "Kish", value: "'Kish', sans-serif", category: "display" },
] as const;

export type FontOption = (typeof FONTS)[number];

export interface TypographySettings {
  fontSize: number; // percentage (e.g. 100)
  lineHeight: number; // unitless multiplier (e.g. 1.4)
  letterSpacing: number; // em unit (e.g. 0)
}

export interface QuoteState {
  quote: Quote | null;
  background: UnsplashPhoto | null;
  font: FontOption;
  typography: TypographySettings;
  isLoading: boolean;
}

export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  fontSize: 100,
  lineHeight: 1.6,
  letterSpacing: 0,
};

export function useQuote() {
  const [state, setState] = useState<QuoteState>({
    quote: null,
    background: null,
    font: FONTS[0],
    typography: DEFAULT_TYPOGRAPHY,
    isLoading: true,
  });

  const refreshQuote = useCallback(async () => {
    const quote = await fetchRandomQuote();
    setState((prev) => ({ ...prev, quote }));
  }, []);

  const refreshBackground = useCallback(async (settings?: Settings) => {
    const background = await fetchRandomBackground(settings);
    setState((prev) => ({ ...prev, background }));
  }, []);

  const setFont = useCallback((font: FontOption) => {
    setState((prev) => ({ ...prev, font }));
  }, []);

  const setTypography = useCallback((typography: Partial<TypographySettings>) => {
    setState((prev) => ({
      ...prev,
      typography: { ...prev.typography, ...typography },
    }));
  }, []);

  const cycleFont = useCallback(() => {
    setState((prev) => {
      const currentIndex = FONTS.findIndex((f) => f.name === prev.font.name);
      const nextIndex = (currentIndex + 1) % FONTS.length;
      return { ...prev, font: FONTS[nextIndex] };
    });
  }, []);

  const refreshAll = useCallback(async (settings?: Settings) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const [quote, background] = await Promise.all([
      fetchRandomQuote(),
      fetchRandomBackground(settings),
    ]);
    setState((prev) => ({ ...prev, quote, background, isLoading: false }));
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const [q, bg] = await Promise.all([fetchRandomQuote(), fetchRandomBackground()]);
      if (mounted) {
        setState((prev) => ({ ...prev, quote: q, background: bg, isLoading: false }));
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  const loadState = useCallback(
    (
      quote: Quote,
      background: UnsplashPhoto,
      font: FontOption,
      typography?: TypographySettings,
    ) => {
      setState((prev) => ({
        ...prev,
        quote,
        background,
        font,
        typography: typography || DEFAULT_TYPOGRAPHY,
      }));
    },
    [],
  );

  const setQuote = useCallback((quote: Quote) => {
    setState((prev) => ({ ...prev, quote }));
  }, []);

  return {
    ...state,
    refreshQuote,
    refreshBackground,
    setFont,
    setTypography,
    cycleFont,
    refreshAll,
    loadState,
    setQuote,
  };
}
