import { Bookmark, Eye, Heart, Image, RefreshCw, Type } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface ControlPanelProps {
  onRefreshQuote: () => void
  onRefreshBackground: () => void
  onCycleFont: () => void
  onDownload: () => void
  onSave: () => void
  onOpenFavorites: () => void
  isSaving?: boolean
  isSaved?: boolean
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  color: string
}

const PARTICLE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"]

function ParticleBurst({ active, triggerKey }: { active: boolean; triggerKey: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    if (!active || triggerKey === 0) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    particlesRef.current = Array.from({ length: 6 }).map((_, i) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8
      const speed = 1.8 + Math.random() * 1.2
      return {
        id: i,
        x: 70,
        y: 80,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: angle + Math.PI / 2,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      }
    })

    const gravity = 0.06
    let frame = 0
    const maxFrames = 90
    const airResistance = 0.98
    const rotationSmoothing = 0.15

    const animate = () => {
      if (frame >= maxFrames) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particlesRef.current) {
        p.vx *= airResistance
        p.vy *= airResistance
        p.vy += gravity
        p.x += p.vx
        p.y += p.vy

        const targetRotation = Math.atan2(p.vy, p.vx) + Math.PI / 2
        const rotationDiff = targetRotation - p.rotation
        p.rotation += rotationDiff * rotationSmoothing

        const alpha = (1 - frame / maxFrames) ** 0.7

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.roundRect(-1.5, -6, 3, 12, 1.5)
        ctx.fill()
        ctx.restore()
      }

      frame++
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [active, triggerKey])

  return (
    <canvas
      ref={canvasRef}
      width={140}
      height={160}
      className="absolute pointer-events-none"
      style={{ left: "-52px", top: "-100px" }}
    />
  )
}

export function ControlPanel({
  onRefreshQuote,
  onRefreshBackground,
  onCycleFont,
  onDownload,
  onSave,
  onOpenFavorites,
  isSaving,
  isSaved,
}: ControlPanelProps) {
  const [activeButton, setActiveButton] = useState<string | null>(null)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [burstKey, setBurstKey] = useState(0)

  const handleClick = useCallback((key: string, action: () => void) => {
    setActiveButton(key)
    action()
    setTimeout(() => setActiveButton(null), 150)
  }, [])

  const handleSave = useCallback(() => {
    if (!isSaved) {
      setBurstKey((k) => k + 1)
    }
    onSave()
  }, [isSaved, onSave])

  const buttons = useMemo(
    () => [
      { key: "quote", icon: RefreshCw, label: "Quote", onClick: onRefreshQuote, shortcut: "1" },
      { key: "bg", icon: Image, label: "Background", onClick: onRefreshBackground, shortcut: "2" },
      { key: "font", icon: Type, label: "Font", onClick: onCycleFont, shortcut: "3" },
      { key: "screenshot", icon: Eye, label: "View", onClick: onDownload, shortcut: "4" },
      {
        key: "save",
        icon: Heart,
        label: isSaved ? "Saved" : "Save",
        onClick: handleSave,
        loading: isSaving,
        special: true,
        shortcut: "5",
      },
      {
        key: "favorites",
        icon: Bookmark,
        label: "Favorites",
        onClick: onOpenFavorites,
        shortcut: "6",
      },
    ],
    [
      onRefreshQuote,
      onRefreshBackground,
      onCycleFont,
      onDownload,
      handleSave,
      isSaving,
      isSaved,
      onOpenFavorites,
    ],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return

      const button = buttons.find((b) => b.shortcut === e.key)
      if (button && !button.loading) {
        handleClick(button.key, button.onClick)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [buttons, handleClick])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex items-center gap-1 p-1.5 rounded-2xl"
        style={{
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {buttons.map(({ key, icon: Icon, label, onClick, loading, special, shortcut }) => {
          const isPressed = activeButton === key
          const isHovered = hoveredButton === key
          const isSaveButton = special
          const showFilledHeart = isSaveButton && isSaved

          let bgColor = "transparent"
          if (isPressed) bgColor = "rgba(255,255,255,0.12)"
          else if (isHovered) bgColor = "rgba(255,255,255,0.08)"

          return (
            <div key={key} className="relative group">
              <div
                className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                style={{ backdropFilter: "blur(4px)" }}
              >
                <div className="flex items-center gap-1">
                  <span>{label}</span>
                  <span className="opacity-50">|</span>
                  <span className="font-mono">{shortcut}</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45" />
              </div>

              <button
                type="button"
                onClick={() => handleClick(key, onClick)}
                onMouseEnter={() => setHoveredButton(key)}
                onMouseLeave={() => setHoveredButton(null)}
                disabled={loading}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-100 ease-out whitespace-nowrap select-none"
                style={{
                  background: bgColor,
                  transform: isPressed ? "scale(0.96)" : "scale(1)",
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? "wait" : "pointer",
                  overflow: "visible",
                }}
              >
                {isSaveButton && <ParticleBurst active={burstKey > 0} triggerKey={burstKey} />}
                <Icon
                  className={`w-[18px] h-[18px] transition-all duration-200 ${loading ? "animate-spin" : ""}`}
                  style={{
                    color: showFilledHeart ? "#ef4444" : "rgba(255,255,255,0.85)",
                    fill: showFilledHeart ? "#ef4444" : "none",
                  }}
                />
                <span
                  className="text-[13px] font-medium hidden sm:block transition-colors duration-200"
                  style={{
                    color: showFilledHeart ? "#ef4444" : "rgba(255,255,255,0.9)",
                    minWidth: isSaveButton ? "36px" : undefined,
                  }}
                >
                  {label}
                </span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
