import { Book, Check, GripVertical, Plus, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuotesLibrary } from "@/hooks/useQuotesLibrary";
import type { Settings } from "@/hooks/useSettings";

type TabId = "services" | "queries" | "library";

interface SettingsPanelProps {
  settings: Settings;
  onUpdateImageService: (
    service: "pexels" | "unsplash",
    config: { enabled?: boolean; priority?: number },
  ) => void;
  onReorderImageServices: (order: ("pexels" | "unsplash")[]) => void;
  onAddSearchQuery: (query: string) => void;
  onRemoveSearchQuery: (query: string) => void;
  onSelectQuote: (quote: { content: string; author: string }) => void;
  onClose: () => void;
}

const TABS = [
  { id: "services" as const, label: "Services" },
  { id: "queries" as const, label: "Queries" },
  { id: "library" as const, label: "Library" },
];

export function SettingsPanel({
  settings,
  onUpdateImageService,
  onReorderImageServices,
  onAddSearchQuery,
  onRemoveSearchQuery,
  onSelectQuote,
  onClose,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("services");
  const [newQuery, setNewQuery] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { quotes, total, hasMore, isLoading, loadMore } = useQuotesLibrary();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleTabChange = (tab: TabId) => {
    if (tab === activeTab || isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsExiting(false);
    }, 200);
  };

  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  const handleAddQuery = () => {
    if (newQuery.trim()) {
      onAddSearchQuery(newQuery.trim());
      setNewQuery("");
      inputRef.current?.focus();
    }
  };

  const sortedServices = [
    { key: "unsplash" as const, name: "Unsplash", desc: "Community photography" },
    { key: "pexels" as const, name: "Pexels", desc: "Curated stock photos" },
  ].sort((a, b) => settings.imageServices[a.key].priority - settings.imageServices[b.key].priority);

  const handleDragStart = (e: React.DragEvent, key: string) => {
    setDraggedItem(key);
    e.dataTransfer.effectAllowed = "move";
    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetKey) return;

    const newOrder = sortedServices.map((s) =>
      s.key === targetKey ? draggedItem : s.key === draggedItem ? targetKey : s.key,
    ) as ("pexels" | "unsplash")[];
    onReorderImageServices(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-8">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-10px); }
        }
        .tab-enter { animation: fadeSlideIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; animation-delay: 0.1s; opacity: 0; }
        .tab-exit { animation: fadeSlideOut 0.2s cubic-bezier(0.4, 0, 1, 1) forwards; }
        .height-transition { transition: height 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
      `}</style>

      <button
        type="button"
        className="absolute inset-0 cursor-default border-none"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
        onClick={handleClose}
        aria-label="Close settings"
      />

      <div
        className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-3xl overflow-hidden glass shadow-2xl animate-fade-in-up"
        style={{
          background: "rgba(10, 10, 15, 0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-2xl font-bold bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
              Settings
            </h2>
            <p className="text-sm text-zinc-400">Configure your experience</p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 overflow-x-auto shrink-0">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-black shadow-lg shadow-white/10"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {activeTab === "library" && (
            <div className="ml-auto text-xs text-zinc-500 hidden sm:block animate-fade-in">
              {total} quotes cached
            </div>
          )}
        </div>

        <div
          className="relative overflow-y-auto height-transition"
          style={{ height: height ? `${height}px` : "auto", maxHeight: "calc(85vh - 180px)" }}
        >
          <div ref={contentRef}>
            <div className="p-6">
              <div className={isExiting ? "tab-exit" : "tab-enter"} key={activeTab}>
                {activeTab === "services" && (
                  <ul className="space-y-3">
                    <p className="text-sm text-zinc-500 mb-4">
                      Drag to reorder services. Top service has highest priority.
                    </p>
                    {sortedServices.map(({ key, name, desc }) => {
                      const config = settings.imageServices[key];
                      const isActive = config.enabled;
                      const isDragging = draggedItem === key;

                      return (
                        <li
                          key={key}
                          draggable
                          onDragStart={(e) => handleDragStart(e, key)}
                          onDragOver={(e) => handleDragOver(e, key)}
                          onDragEnd={handleDragEnd}
                          className={`service-item w-full flex items-center justify-between p-4 rounded-2xl border cursor-move ${
                            isActive ? "bg-white/8 border-white/20" : "bg-white/3 border-white/5"
                          } ${isDragging ? "drag-ghost" : "hover:bg-white/5"}`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="text-zinc-500 cursor-grab active:cursor-grabbing p-1 hover:text-zinc-300 transition-colors">
                              <GripVertical className="w-5 h-5" />
                            </div>
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg select-none ${
                                isActive ? "bg-white text-black" : "bg-white/10 text-zinc-500"
                              }`}
                            >
                              {config.priority}
                            </div>
                            <div className="text-left select-none">
                              <p
                                className={`font-medium ${isActive ? "text-white" : "text-zinc-400"}`}
                              >
                                {name}
                              </p>
                              <p className="text-sm text-zinc-600">{desc}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onUpdateImageService(key, { enabled: !config.enabled })}
                            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                              isActive
                                ? "bg-white cursor-pointer"
                                : "border border-zinc-600 cursor-pointer hover:border-zinc-500"
                            }`}
                          >
                            {isActive && <Check className="w-4 h-4 text-black" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {activeTab === "queries" && (
                  <div>
                    <div className="flex gap-3 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          ref={inputRef}
                          type="text"
                          value={newQuery}
                          onChange={(e) => setNewQuery(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddQuery()}
                          placeholder="Add new search query..."
                          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddQuery}
                        disabled={!newQuery.trim()}
                        className={`px-4 rounded-xl transition-all duration-200 ${
                          newQuery.trim()
                            ? "bg-white text-black hover:bg-white/90"
                            : "bg-white/5 text-zinc-600"
                        }`}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {settings.searchQueries.map((query) => (
                        <div
                          key={query}
                          className="group flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:border-white/20 transition-all"
                        >
                          <span className="text-sm text-zinc-300">{query}</span>
                          <button
                            type="button"
                            onClick={() => onRemoveSearchQuery(query)}
                            className="w-5 h-5 rounded-full bg-white/10 hover:bg-red-500/60 flex items-center justify-center transition-colors"
                          >
                            <X className="w-3 h-3 text-zinc-400 group-hover:text-white" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {settings.searchQueries.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                        <p>No search queries configured</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "library" && (
                  <div>
                    {quotes.length === 0 && !isLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                        <Book className="w-12 h-12 mb-4 text-zinc-600" />
                        <p>No quotes cached yet</p>
                        <p className="text-sm text-zinc-600 mt-1">
                          Use the app to build your library
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quotes.map((quote) => (
                          <button
                            type="button"
                            key={quote.id}
                            onClick={() => {
                              onSelectQuote({
                                content: quote.quoteText,
                                author: quote.quoteAuthor,
                              });
                              onClose();
                            }}
                            className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                          >
                            <p className="text-sm text-zinc-300 line-clamp-2 group-hover:text-white transition-colors">
                              "{quote.quoteText}"
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-zinc-500">— {quote.quoteAuthor}</span>
                              <span className="text-xs text-zinc-600">
                                {quote.savedAt
                                  ? new Date(quote.savedAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : ""}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {hasMore && quotes.length > 0 && (
                      <button
                        type="button"
                        onClick={loadMore}
                        disabled={isLoading}
                        className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all disabled:opacity-50"
                      >
                        {isLoading ? "Loading..." : "Load More"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
