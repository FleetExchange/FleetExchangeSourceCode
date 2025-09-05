import { getGeocode, getLatLng } from "use-places-autocomplete";

// In-memory cache for city coordinates
const CITY_COORDINATES_CACHE = new Map<string, { lat: number; lng: number }>();

// Preloaded common South African cities to avoid API calls
export const SOUTH_AFRICAN_CITIES: Record<
  string,
  { lat: number; lng: number }
> = {
  johannesburg: { lat: -26.2041, lng: 28.0473 },
  "cape town": { lat: -33.9249, lng: 18.4241 },
  durban: { lat: -29.8587, lng: 31.0218 },
  pretoria: { lat: -25.7479, lng: 28.2293 },
  "port elizabeth": { lat: -33.9608, lng: 25.6022 },
  bloemfontein: { lat: -29.0852, lng: 26.1596 },
  "east london": { lat: -33.0153, lng: 27.9116 },
  pietermaritzburg: { lat: -29.6196, lng: 30.3794 },
  nelspruit: { lat: -25.4753, lng: 30.977 },
  kimberley: { lat: -28.7282, lng: 24.7499 },
  polokwane: { lat: -23.9045, lng: 29.4689 },
  rustenburg: { lat: -25.6672, lng: 27.2424 },
  witbank: { lat: -25.8661, lng: 29.2349 },
  klerksdorp: { lat: -26.8515, lng: 26.6647 },
  welkom: { lat: -27.9794, lng: 26.7339 },
};

export const getCachedCityCoordinates = async (
  cityName: string
): Promise<{ lat: number; lng: number }> => {
  const normalizedCity = cityName.toLowerCase().trim();
  const cacheKey = `${normalizedCity}, south africa`;

  // Check preloaded cities first (no API call needed)
  if (SOUTH_AFRICAN_CITIES[normalizedCity]) {
    console.log(`📍 Using preloaded coordinates for ${cityName}`);
    return SOUTH_AFRICAN_CITIES[normalizedCity];
  }

  // Check cache
  if (CITY_COORDINATES_CACHE.has(cacheKey)) {
    console.log(`📍 Using cached coordinates for ${cityName}`);
    return CITY_COORDINATES_CACHE.get(cacheKey)!;
  }

  // Make API call only if not cached
  try {
    console.log(`🚨 GEOCODING API CALL for ${cityName}`);
    const results = await getGeocode({ address: cacheKey });
    const coords = await getLatLng(results[0]);

    // Cache the result
    CITY_COORDINATES_CACHE.set(cacheKey, coords);
    return coords;
  } catch (error) {
    console.error("Error getting coordinates for city:", error);
    const defaultCoords = { lat: -26.2041, lng: 28.0473 }; // Johannesburg

    // Cache the default to avoid repeated failures
    CITY_COORDINATES_CACHE.set(cacheKey, defaultCoords);
    return defaultCoords;
  }
};

// Clear cache function (useful for development)
export const clearCityCoordinatesCache = () => {
  CITY_COORDINATES_CACHE.clear();
  console.log("🧹 City coordinates cache cleared");
};

// Get cache stats
export const getCacheStats = () => {
  return {
    cacheSize: CITY_COORDINATES_CACHE.size,
    preloadedCities: Object.keys(SOUTH_AFRICAN_CITIES).length,
    cachedCities: Array.from(CITY_COORDINATES_CACHE.keys()),
  };
};
