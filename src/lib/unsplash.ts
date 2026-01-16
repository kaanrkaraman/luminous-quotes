import type { Settings } from "@/hooks/useSettings";

export interface BackgroundPhoto {
  id: string;
  url: string;
  photographer: string;
  photographerUrl: string;
  imagePageUrl: string;
  source: "pexels" | "unsplash" | "fallback";
}

const FALLBACK_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80",
  "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920&q=80",
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80",
  "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=80",
];

const DEFAULT_SEARCH_QUERIES = [
  "abstract",
  "gradient",
  "dark wallpaper",
  "nature minimal",
  "cosmic",
];

function getFallbackPhoto(): BackgroundPhoto {
  const randomUrl = FALLBACK_BACKGROUNDS[Math.floor(Math.random() * FALLBACK_BACKGROUNDS.length)];
  return {
    id: "fallback",
    url: randomUrl,
    photographer: "Unsplash",
    photographerUrl: "https://unsplash.com",
    imagePageUrl: "https://unsplash.com",
    source: "fallback",
  };
}

async function fetchFromPexels(apiKey: string, queries: string[]): Promise<BackgroundPhoto | null> {
  try {
    const query = queries[Math.floor(Math.random() * queries.length)];
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=15`,
      { headers: { Authorization: apiKey } },
    );
    if (!response.ok) throw new Error("Pexels API failed");
    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
      return {
        id: photo.id.toString(),
        url: photo.src.large2x || photo.src.large,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        imagePageUrl: photo.url,
        source: "pexels",
      };
    }
  } catch (error) {
    console.error("Pexels fetch failed:", error);
  }
  return null;
}

async function fetchFromUnsplash(
  accessKey: string,
  queries: string[],
): Promise<BackgroundPhoto | null> {
  try {
    const query = queries[Math.floor(Math.random() * queries.length)];
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${accessKey}` } },
    );
    if (!response.ok) throw new Error("Unsplash API failed");
    const data = await response.json();
    return {
      id: data.id,
      url: `${data.urls.raw}&w=1920&q=80`,
      photographer: data.user.name,
      photographerUrl: `${data.user.links.html}?utm_source=luminous_quotes&utm_medium=referral`,
      imagePageUrl: `${data.links.html}?utm_source=luminous_quotes&utm_medium=referral`,
      source: "unsplash",
    };
  } catch (error) {
    console.error("Unsplash fetch failed:", error);
  }
  return null;
}

export async function fetchRandomBackground(settings?: Settings): Promise<BackgroundPhoto> {
  const pexelsKey = import.meta.env.VITE_PEXELS_API_KEY;
  const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const queries = settings?.searchQueries?.length ? settings.searchQueries : DEFAULT_SEARCH_QUERIES;

  const services = settings?.imageServices || {
    pexels: { enabled: true, priority: 1 },
    unsplash: { enabled: true, priority: 2 },
  };

  const sortedServices = [
    { name: "pexels" as const, ...services.pexels },
    { name: "unsplash" as const, ...services.unsplash },
  ]
    .filter((s) => s.enabled)
    .sort((a, b) => a.priority - b.priority);

  for (const service of sortedServices) {
    if (service.name === "pexels" && pexelsKey && pexelsKey !== "your_pexels_api_key_here") {
      const photo = await fetchFromPexels(pexelsKey, queries);
      if (photo) return photo;
    }
    if (
      service.name === "unsplash" &&
      unsplashKey &&
      unsplashKey !== "your_unsplash_access_key_here"
    ) {
      const photo = await fetchFromUnsplash(unsplashKey, queries);
      if (photo) return photo;
    }
  }

  return getFallbackPhoto();
}

export type UnsplashPhoto = BackgroundPhoto;
