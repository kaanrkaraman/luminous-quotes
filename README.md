# Luminous Quotes

Create beautiful quote images with stunning backgrounds and premium typography.

## Features

- 🎨 **Dynamic Backgrounds** — Unsplash integration with elegant fallbacks
- ✨ **Premium Fonts** — 10 curated display fonts from Fontshare
- 💾 **Save Favorites** — Persist your favorite quote combinations locally
- 📸 **Screenshot Mode** — Clean export-ready view
- ⌨️ **Keyboard Shortcuts** — Quick actions via number keys 1-6

## Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Vite 7
- **Backend**: Bun, Hono
- **Database**: SQLite with Drizzle ORM
- **APIs**: ZenQuotes, Unsplash

## Quick Start

```bash
# Install dependencies
bun install

# Start development servers
bun run dev

# Server runs on :4000, client on :4001
```

## Environment

Copy `.env.example` to `.env.local` and add your Unsplash API key for live backgrounds:

```
VITE_UNSPLASH_ACCESS_KEY=your_key_here
```

## License

MIT
