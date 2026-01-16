import { forwardRef } from "react";
import type { FontOption, TypographySettings } from "@/hooks/useQuote";
import type { Quote } from "@/lib/quotes";
import type { UnsplashPhoto } from "@/lib/unsplash";

interface QuoteCardProps {
  quote: Quote | null;
  background: UnsplashPhoto | null;
  font: FontOption;
  typography: TypographySettings;
}

function getQuoteSourceLabel(source?: string): string {
  switch (source) {
    case "zenquotes":
      return "ZenQuotes";
    case "database":
      return "Cached";
    case "fallback":
      return "Local";
    default:
      return "ZenQuotes";
  }
}

function getPhotoSourceLabel(source?: string): string {
  switch (source) {
    case "pexels":
      return "Pexels";
    case "unsplash":
      return "Unsplash";
    default:
      return "Unsplash";
  }
}

export const QuoteCard = forwardRef<HTMLDivElement, QuoteCardProps>(
  ({ quote, background, font, typography }, ref) => {
    if (!quote || !background) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-(--color-bg-primary)">
          <div className="w-8 h-8 border-2 border-(--color-accent-cyan) border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    const quoteSourceLabel = getQuoteSourceLabel(quote.source);
    const photoSourceLabel = getPhotoSourceLabel(background.source);

    return (
      <div ref={ref} className="relative w-full h-full overflow-hidden fade-in">
        <img
          key={background.id}
          src={`http://localhost:4000/api/proxy-image?url=${encodeURIComponent(background.url)}`}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/50" />

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 md:p-16">
          <div className="max-w-4xl text-center text-2xl md:text-4xl lg:text-5xl">
            <blockquote
              key={`${quote.content}-text`}
              className="font-medium leading-relaxed text-white mb-8 drop-shadow-lg animate-fade-in-up"
              style={{
                fontFamily: font.value,
                animationFillMode: "both",
                fontSize: `${typography.fontSize}%`,
                lineHeight: typography.lineHeight,
                letterSpacing: `${typography.letterSpacing}em`,
              }}
            >
              "{quote.content}"
            </blockquote>

            <cite
              key={`${quote.author}-author`}
              className="text-lg md:text-xl text-white/80 not-italic font-medium animate-fade-in-up"
              style={{ fontFamily: font.value, animationDelay: "100ms", animationFillMode: "both" }}
            >
              — {quote.author}
            </cite>
          </div>
        </div>

        <div
          key={`quote-${quote.content.slice(0, 20)}`}
          className="absolute bottom-4 left-4 z-20 animate-fade-in"
          style={{ animationDuration: "0.4s" }}
        >
          <span className="text-xs text-white/40">Quote from {quoteSourceLabel}</span>
        </div>

        <div
          key={`photo-${background.id}`}
          className="absolute bottom-4 right-4 z-20 animate-fade-in"
          style={{ animationDuration: "0.4s" }}
        >
          <a
            href={background.imagePageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Photo by {background.photographer} on {photoSourceLabel}
          </a>
        </div>
      </div>
    );
  },
);

QuoteCard.displayName = "QuoteCard";
