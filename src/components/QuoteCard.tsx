import { forwardRef } from "react"
import type { FontOption } from "@/hooks/useQuote"
import type { Quote } from "@/lib/quotes"
import type { UnsplashPhoto } from "@/lib/unsplash"

interface QuoteCardProps {
  quote: Quote | null
  background: UnsplashPhoto | null
  font: FontOption
}

export const QuoteCard = forwardRef<HTMLDivElement, QuoteCardProps>(
  ({ quote, background, font }, ref) => {
    if (!quote || !background) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-(--color-bg-primary)">
          <div className="w-8 h-8 border-2 border-(--color-accent-cyan) border-t-transparent rounded-full animate-spin" />
        </div>
      )
    }

    return (
      <div ref={ref} className="relative w-full h-full overflow-hidden fade-in">
        <img
          src={`http://localhost:4000/api/proxy-image?url=${encodeURIComponent(background.url)}`}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/50" />

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 md:p-16">
          <div className="max-w-4xl text-center">
            <blockquote
              key={`${quote.content}-text`}
              className="text-2xl md:text-4xl lg:text-5xl font-medium leading-relaxed text-white mb-8 drop-shadow-lg animate-fade-in-up"
              style={{ fontFamily: font.value, animationFillMode: "both" }}
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

        <div className="absolute bottom-4 right-4 z-20">
          <a
            href={background.imagePageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            Photo by {background.photographer}
          </a>
        </div>
      </div>
    )
  },
)

QuoteCard.displayName = "QuoteCard"
