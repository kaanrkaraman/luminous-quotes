import { Check, Search, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { FONTS, type FontOption } from "@/hooks/useQuote"

interface FontSelectorProps {
  currentFont: FontOption
  onSelect: (font: FontOption) => void
  onPreview: (font: FontOption) => void
  onClose: () => void
}

const CATEGORIES = ["All", "Sans", "Serif", "Display"] as const
type Category = (typeof CATEGORIES)[number]

export function FontSelector({ currentFont, onSelect, onPreview, onClose }: FontSelectorProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<Category>("All")

  const [activeSelection, setActiveSelection] = useState(currentFont.name)
  const initialFontRef = useRef(currentFont)
  const wasSelectedRef = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  useEffect(() => {
    const original = initialFontRef.current
    return () => {
      if (!wasSelectedRef.current) {
        onPreview(original)
      }
    }
  }, [onPreview])

  const filteredFonts = useMemo(() => {
    return FONTS.filter((font) => {
      const matchesSearch = font.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        category === "All" || font.category.toLowerCase() === category.toLowerCase()
      return matchesSearch && matchesCategory
    })
  }, [search, category])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        className="absolute inset-0 cursor-default border-none"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
        aria-label="Close font selector"
      />

      <div
        className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-3xl overflow-hidden glass shadow-2xl animate-fade-in-up"
        style={{
          background: "rgba(10, 10, 15, 0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
              Font Gallery
            </h2>
            <p className="text-sm text-zinc-400">Select a typeface for your quote</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search fonts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                category === cat
                  ? "bg-white text-black shadow-lg shadow-white/10"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="ml-auto text-xs text-zinc-500 hidden sm:block">
            {filteredFonts.length} fonts available
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFonts.map((font) => {
              const isActive = activeSelection === font.name

              return (
                <button
                  type="button"
                  key={font.name}
                  onClick={() => {
                    wasSelectedRef.current = true
                    setActiveSelection(font.name)
                    onSelect(font)
                    onClose()
                  }}
                  onMouseEnter={() => {
                    onPreview(font)
                  }}
                  className={`group relative flex flex-col items-start p-5 rounded-2xl border transition-all duration-200 text-left ${
                    isActive
                      ? "bg-white/10 border-white/40 ring-1 ring-white/20"
                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                        isActive
                          ? "bg-white text-black"
                          : "bg-black/40 text-zinc-400 group-hover:text-zinc-300"
                      }`}
                    >
                      {font.category}
                    </span>
                    {isActive && <Check className="w-4 h-4 text-white" />}
                  </div>

                  <span
                    className="text-3xl leading-tight mb-4 transition-transform duration-300 group-hover:scale-105 origin-left"
                    style={{ fontFamily: font.value }}
                  >
                    Ag
                  </span>

                  <div className="mt-auto">
                    <p
                      className={`font-medium ${isActive ? "text-white" : "text-zinc-300 group-hover:text-white"}`}
                    >
                      {font.name}
                    </p>
                    <p
                      className="text-sm text-zinc-500 mt-1 line-clamp-1"
                      style={{ fontFamily: font.value }}
                    >
                      The quick brown fox jumps over the lazy dog
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {filteredFonts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <p>No fonts found for "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
