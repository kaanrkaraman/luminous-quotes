export interface UnsplashPhoto {
  id: string
  url: string
  photographer: string
  photographerUrl: string
  imagePageUrl: string
  downloadLink: string
}

const FALLBACK_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80",
  "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920&q=80",
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80",
  "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=80",
]

const SEARCH_QUERIES = ["abstract", "gradient", "dark wallpaper", "nature minimal", "cosmic"]

const APP_NAME = "quotemaker"

export async function fetchRandomBackground(): Promise<UnsplashPhoto> {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

  if (!accessKey || accessKey === "your_unsplash_access_key_here") {
    const randomUrl = FALLBACK_BACKGROUNDS[Math.floor(Math.random() * FALLBACK_BACKGROUNDS.length)]
    return {
      id: "fallback",
      url: randomUrl,
      photographer: "Unsplash",
      photographerUrl: `https://unsplash.com?utm_source=${APP_NAME}&utm_medium=referral`,
      imagePageUrl: `https://unsplash.com?utm_source=${APP_NAME}&utm_medium=referral`,
      downloadLink: "",
    }
  }

  try {
    const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)]
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${accessKey}` } },
    )
    if (!response.ok) throw new Error("API unavailable")
    const data = await response.json()
    return {
      id: data.id,
      url: `${data.urls.raw}&w=1920&q=80`,
      photographer: data.user.name,
      photographerUrl: `${data.user.links.html}?utm_source=${APP_NAME}&utm_medium=referral`,
      imagePageUrl: `${data.links.html}?utm_source=${APP_NAME}&utm_medium=referral`,
      downloadLink: data.links.download_location,
    }
  } catch {
    const randomUrl = FALLBACK_BACKGROUNDS[Math.floor(Math.random() * FALLBACK_BACKGROUNDS.length)]
    return {
      id: "fallback",
      url: randomUrl,
      photographer: "Unsplash",
      photographerUrl: `https://unsplash.com?utm_source=${APP_NAME}&utm_medium=referral`,
      imagePageUrl: `https://unsplash.com?utm_source=${APP_NAME}&utm_medium=referral`,
      downloadLink: "",
    }
  }
}

export async function triggerUnsplashDownload(downloadLocation: string) {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
  if (!downloadLocation || !accessKey) return

  try {
    await fetch(downloadLocation, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    })
  } catch (e) {
    console.error("Failed to trigger download endpoint", e)
  }
}
