import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ControlPanel } from "@/components/ControlPanel";
import { FontSelector } from "@/components/FontSelector";
import { QuoteCard } from "@/components/QuoteCard";
import { SavedQuotesGallery } from "@/components/SavedQuotesGallery";
import { SettingsPanel } from "@/components/SettingsPanel";
import type { SavedQuote } from "@/db/schema";
import { FONTS, useQuote } from "@/hooks/useQuote";
import { useSavedQuotes } from "@/hooks/useSavedQuotes";
import { useSettings } from "@/hooks/useSettings";
import { fetchRandomBackground } from "@/lib/unsplash";
import "@/styles/globals.css";

export default function App() {
  const quoteCardRef = useRef<HTMLDivElement>(null);
  const [showFontSelector, setShowFontSelector] = useState(false);
  const [showSavedQuotes, setShowSavedQuotes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);

  useEffect(() => {
    if (!isScreenshotMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsScreenshotMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isScreenshotMode]);

  const {
    quote,
    background,
    font,
    typography,
    refreshQuote,
    refreshBackground,
    setFont,
    setTypography,
    loadState,
    setQuote,
  } = useQuote();
  const { savedQuotes, addSavedQuote, updateSavedQuote, removeSavedQuote } = useSavedQuotes();
  const { settings, updateImageService, reorderImageServices, addSearchQuery, removeSearchQuery } =
    useSettings();

  const handleSelectQuote = useCallback(
    (selectedQuote: { content: string; author: string }) => {
      setQuote({ ...selectedQuote, source: "database" });
    },
    [setQuote],
  );

  const currentSavedQuoteId = useMemo(() => {
    if (!quote || !background) return null;

    const normalize = (str: string) => str.replace(/\s/g, "").toLowerCase();

    const match = savedQuotes.find(
      (sq) =>
        sq.quoteText === quote.content &&
        sq.quoteAuthor === quote.author &&
        sq.backgroundUrl === background.url &&
        (sq.fontFamily === font.value || normalize(sq.fontFamily || "") === normalize(font.value)),
    );
    return match?.id ?? null;
  }, [quote, background, font, savedQuotes]);

  const isSaved = currentSavedQuoteId !== null;

  const handleToggleSave = useCallback(async () => {
    if (!quote || !background) return;
    setIsSaving(true);
    try {
      if (currentSavedQuoteId !== null) {
        await removeSavedQuote(currentSavedQuoteId);
      } else {
        await addSavedQuote({
          quoteText: quote.content,
          quoteAuthor: quote.author,
          backgroundUrl: background.url,
          fontFamily: font.value,
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [quote, background, font, currentSavedQuoteId, addSavedQuote, removeSavedQuote]);

  const handleSelectSavedQuote = useCallback(
    (savedQuote: SavedQuote) => {
      const restoredQuote = { content: savedQuote.quoteText, author: savedQuote.quoteAuthor };
      const restoredBg = {
        id: "restored",
        url: savedQuote.backgroundUrl,
        photographer: "Unsplash",
        photographerUrl: "https://unsplash.com",
        imagePageUrl: "https://unsplash.com",
        source: "fallback" as const,
      };

      const restoredFont = FONTS.find((f) => f.value === savedQuote.fontFamily) || FONTS[0];

      loadState(restoredQuote, restoredBg, restoredFont);
      setShowSavedQuotes(false);
    },
    [loadState],
  );

  const handleUpdateSavedQuoteBackground = useCallback(
    async (id: number) => {
      const newBg = await fetchRandomBackground(settings);
      await updateSavedQuote(id, { backgroundUrl: newBg.url });
    },
    [updateSavedQuote, settings],
  );

  const handleUpdateSavedQuoteFont = useCallback(
    async (id: number, fontFamily: string) => {
      await updateSavedQuote(id, { fontFamily });
    },
    [updateSavedQuote],
  );

  const handleRefreshBackground = useCallback(async () => {
    await refreshBackground(settings);
  }, [refreshBackground, settings]);

  return (
    <div className="w-full h-full relative">
      <QuoteCard
        ref={quoteCardRef}
        quote={quote}
        background={background}
        font={font}
        typography={typography}
      />

      {!isScreenshotMode && (
        <>
          <ControlPanel
            onRefreshQuote={refreshQuote}
            onRefreshBackground={handleRefreshBackground}
            onCycleFont={() => setShowFontSelector(true)}
            onDownload={() => setIsScreenshotMode(true)}
            onSave={handleToggleSave}
            onOpenFavorites={() => setShowSavedQuotes(true)}
            onOpenSettings={() => setShowSettings(true)}
            isSaving={isSaving}
            isSaved={isSaved}
          />

          {showFontSelector && (
            <FontSelector
              currentFont={font}
              typography={typography}
              onPreview={setFont}
              onChangeTypography={setTypography}
              onSelect={(f) => {
                setFont(f);
                setShowFontSelector(false);
              }}
              onClose={() => setShowFontSelector(false)}
            />
          )}

          <SavedQuotesGallery
            savedQuotes={savedQuotes}
            isOpen={showSavedQuotes}
            onClose={() => setShowSavedQuotes(false)}
            onSelect={handleSelectSavedQuote}
            onDelete={removeSavedQuote}
            onUpdateBackground={handleUpdateSavedQuoteBackground}
            onUpdateFont={handleUpdateSavedQuoteFont}
          />

          {showSettings && (
            <SettingsPanel
              settings={settings}
              onUpdateImageService={updateImageService}
              onReorderImageServices={reorderImageServices}
              onAddSearchQuery={addSearchQuery}
              onRemoveSearchQuery={removeSearchQuery}
              onSelectQuote={handleSelectQuote}
              onClose={() => setShowSettings(false)}
            />
          )}
        </>
      )}

      {isScreenshotMode && (
        <button
          type="button"
          className="absolute inset-0 z-50 cursor-zoom-out w-full h-full border-none bg-transparent"
          onClick={() => setIsScreenshotMode(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsScreenshotMode(false);
          }}
          title="Click to exit screenshot mode"
          aria-label="Exit screenshot mode"
        />
      )}
    </div>
  );
}
