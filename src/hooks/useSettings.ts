import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "luminous-quotes-settings";

const DEFAULT_SEARCH_QUERIES = [
  "abstract",
  "gradient",
  "dark wallpaper",
  "nature minimal",
  "cosmic",
];

export interface ImageServiceConfig {
  enabled: boolean;
  priority: number;
}

export interface Settings {
  imageServices: {
    pexels: ImageServiceConfig;
    unsplash: ImageServiceConfig;
  };
  searchQueries: string[];
}

const DEFAULT_SETTINGS: Settings = {
  imageServices: {
    pexels: { enabled: true, priority: 2 },
    unsplash: { enabled: true, priority: 1 },
  },
  searchQueries: DEFAULT_SEARCH_QUERIES,
};

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateImageService = useCallback(
    (service: "pexels" | "unsplash", config: Partial<ImageServiceConfig>) => {
      setSettings((prev) => ({
        ...prev,
        imageServices: {
          ...prev.imageServices,
          [service]: { ...prev.imageServices[service], ...config },
        },
      }));
    },
    [],
  );

  const reorderImageServices = useCallback((order: ("pexels" | "unsplash")[]) => {
    setSettings((prev) => {
      const newServices = { ...prev.imageServices };
      order.forEach((service, index) => {
        newServices[service] = { ...newServices[service], priority: index + 1 };
      });
      return { ...prev, imageServices: newServices };
    });
  }, []);

  const addSearchQuery = useCallback((query: string) => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return;
    setSettings((prev) => {
      if (prev.searchQueries.includes(trimmed)) return prev;
      return { ...prev, searchQueries: [...prev.searchQueries, trimmed] };
    });
  }, []);

  const removeSearchQuery = useCallback((query: string) => {
    setSettings((prev) => ({
      ...prev,
      searchQueries: prev.searchQueries.filter((q) => q !== query),
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateImageService,
    reorderImageServices,
    addSearchQuery,
    removeSearchQuery,
    resetToDefaults,
  };
}
