import { Image, Trash2, Type, X } from "lucide-react"
import { useEffect, useState } from "react"
import type { SavedQuote } from "@/db/schema"
import { FONTS } from "@/hooks/useQuote"

interface SavedQuotesGalleryProps {
  savedQuotes: SavedQuote[]
  isOpen: boolean
  onClose: () => void
  onSelect: (quote: SavedQuote) => void
  onDelete: (id: number) => void
  onUpdateBackground: (id: number) => void
  onUpdateFont: (id: number, fontFamily: string) => void
}

export function SavedQuotesGallery({
  savedQuotes,
  isOpen,
  onClose,
  onSelect,
  onDelete,
  onUpdateBackground,
  onUpdateFont,
}: SavedQuotesGalleryProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsClosing(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShouldRender(false)
      onClose()
    }, 200)
  }

  useEffect(() => {
    if (!isOpen) return
    const triggerClose = () => {
      setIsClosing(true)
      setTimeout(() => {
        setShouldRender(false)
        onClose()
      }, 200)
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") triggerClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!shouldRender) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: "rgba(10, 10, 15, 0.98)",
        backdropFilter: "blur(20px)",
        animation: isClosing ? "fadeOut 0.2s ease-out forwards" : "fadeIn 0.2s ease-out",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-2xl font-semibold" style={{ color: "rgba(255,255,255,0.95)" }}>
          Saved Quotes
        </h2>
        <button
          type="button"
          onClick={handleClose}
          className="p-2 rounded-xl transition-colors duration-150"
          style={{ color: "rgba(255,255,255,0.6)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
          }}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {savedQuotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <span className="text-4xl">✨</span>
            </div>
            <p className="text-xl" style={{ color: "rgba(255,255,255,0.7)" }}>
              No saved quotes yet
            </p>
            <p className="mt-2" style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px" }}>
              Tap the heart to save quotes you love
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {savedQuotes.map((quote, index) => (
              <div
                key={quote.id}
                className="group relative rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  animation: isClosing ? "none" : `scaleIn 0.3s ease-out ${index * 0.05}s both`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                <button
                  type="button"
                  className="w-full aspect-4/3 bg-cover bg-center text-left"
                  style={{ backgroundImage: `url(${quote.backgroundUrl})` }}
                  onClick={() => {
                    onSelect(quote)
                    handleClose()
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.2) 100%)",
                    }}
                  />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <p
                      className="text-base line-clamp-3 mb-1"
                      style={{ fontFamily: quote.fontFamily, color: "rgba(255,255,255,0.95)" }}
                    >
                      "{quote.quoteText}"
                    </p>
                    <p
                      className="text-sm"
                      style={{ fontFamily: quote.fontFamily, color: "rgba(255,255,255,0.5)" }}
                    >
                      — {quote.quoteAuthor}
                    </p>
                  </div>
                </button>

                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  {[
                    {
                      icon: Image,
                      action: () => onUpdateBackground(quote.id),
                      title: "New background",
                    },
                    {
                      icon: Type,
                      action: () => {
                        const idx = FONTS.findIndex((f) => f.value === quote.fontFamily)
                        onUpdateFont(quote.id, FONTS[(idx + 1) % FONTS.length].value)
                      },
                      title: "Change font",
                    },
                    {
                      icon: Trash2,
                      action: () => onDelete(quote.id),
                      title: "Delete",
                      danger: true,
                    },
                  ].map(({ icon: Icon, action, title, danger }) => (
                    <button
                      key={title}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        action()
                      }}
                      className="p-2 rounded-lg transition-all duration-150"
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(8px)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = danger
                          ? "rgba(239,68,68,0.8)"
                          : "rgba(255,255,255,0.15)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0,0,0,0.6)"
                      }}
                      title={title}
                    >
                      <Icon className="w-4 h-4" style={{ color: "rgba(255,255,255,0.9)" }} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 text-center" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
        Press ESC to close
      </div>
    </div>
  )
}
