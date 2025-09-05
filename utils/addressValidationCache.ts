// NOTE: Added real distance-based validation with caching to reduce API hits.

import { getGeocode, getLatLng } from "use-places-autocomplete";

// ---------------------------------------------
// Config
// ---------------------------------------------
const DEFAULT_CITY_FALLBACK = { lat: -26.2041, lng: 28.0473 }; // Johannesburg as safe fallback
const GEO_TIMEOUT_MS = 8000;

// Pre‑seed a few common city centers (helps avoid API calls)
const PRESEEDED_CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  johannesburg: { lat: -26.2041, lng: 28.0473 },
  "cape town": { lat: -33.9249, lng: 18.4241 },
  durban: { lat: -29.8587, lng: 31.0218 },
  pretoria: { lat: -25.7479, lng: 28.2293 },
  "port elizabeth": { lat: -33.9608, lng: 25.6022 },
  bloemfontein: { lat: -29.0852, lng: 26.1596 },
};

// ---------------------------------------------
// Caches
// ---------------------------------------------
const CITY_CENTER_CACHE = new Map<string, { lat: number; lng: number }>();
const ADDRESS_COORD_CACHE = new Map<string, { lat: number; lng: number }>();
const ADDRESS_VALIDATION_CACHE = new Map<string, boolean>();

// ---------------------------------------------
// Utilities
// ---------------------------------------------
const toKey = (str: string) => str.trim().toLowerCase();

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sin1 = Math.sin(dLat / 2);
  const sin2 = Math.sin(dLng / 2);
  const c = sin1 * sin1 + Math.cos(lat1) * Math.cos(lat2) * sin2 * sin2;
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
  return R * d;
}

async function geocodeSingle(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const normalized = toKey(address);
  if (ADDRESS_COORD_CACHE.has(normalized)) {
    return ADDRESS_COORD_CACHE.get(normalized)!;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);

    // use-places-autocomplete getGeocode uses window.google under the hood (no fetch we can abort),
    // timeout here is best-effort if user supplies a custom fetch version later.
    const results = await getGeocode({ address });

    clearTimeout(timeout);
    if (!results?.length) return null;

    const { lat, lng } = await getLatLng(results[0]);
    const coords = { lat, lng };
    ADDRESS_COORD_CACHE.set(normalized, coords);
    return coords;
  } catch {
    return null;
  }
}

async function getCityCenter(
  cityName: string
): Promise<{ lat: number; lng: number }> {
  const normalized = toKey(cityName);
  if (CITY_CENTER_CACHE.has(normalized))
    return CITY_CENTER_CACHE.get(normalized)!;

  // Preseeded?
  if (PRESEEDED_CITY_CENTERS[normalized]) {
    CITY_CENTER_CACHE.set(normalized, PRESEEDED_CITY_CENTERS[normalized]);
    return PRESEEDED_CITY_CENTERS[normalized];
  }

  // Geocode city
  const geo = await geocodeSingle(`${cityName}, South Africa`);
  if (geo) {
    CITY_CENTER_CACHE.set(normalized, geo);
    return geo;
  }

  // Fallback
  CITY_CENTER_CACHE.set(normalized, DEFAULT_CITY_FALLBACK);
  return DEFAULT_CITY_FALLBACK;
}

// ---------------------------------------------
// Distance-based validation
// ---------------------------------------------
const isAddressWithinRange = async (
  address: string,
  cityName: string,
  maxDistanceKm: number = 100
): Promise<boolean> => {
  if (!address || !cityName) return false;

  const cityCenter = await getCityCenter(cityName);
  const addressCoords = await geocodeSingle(address);

  if (!addressCoords) return false;

  const distance = haversineKm(cityCenter, addressCoords);

  // Debug (optional; remove in production)
  console.log(
    `[AddressValidation] ${address} -> ${cityName} distance: ${distance.toFixed(
      2
    )}km (limit ${maxDistanceKm}km)`
  );

  return distance <= maxDistanceKm;
};

// ---------------------------------------------
// Public cached wrapper
// ---------------------------------------------
export const isAddressWithinRangeCached = async (
  address: string,
  cityName: string,
  maxDistanceKm: number = 100
): Promise<boolean> => {
  const normalizedAddress = toKey(address);
  const normalizedCity = toKey(cityName);
  const cacheKey = `${normalizedAddress}|${normalizedCity}|${maxDistanceKm}`;

  console.log("🔍 Validation cache called:", {
    address,
    cityName,
    maxDistanceKm,
  });

  if (ADDRESS_VALIDATION_CACHE.has(cacheKey)) {
    console.log(`📍 Using cached address validation for ${address}`);
    return ADDRESS_VALIDATION_CACHE.get(cacheKey)!;
  }

  try {
    console.log(
      `🚨 ADDRESS VALIDATION DISTANCE CHECK for ${address} in ${cityName}`
    );
    const result = await isAddressWithinRange(address, cityName, maxDistanceKm);
    console.log(`🚨 Distance check result: ${result}`);
    ADDRESS_VALIDATION_CACHE.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("❌ Error validating address:", error);
    ADDRESS_VALIDATION_CACHE.set(cacheKey, false);
    return false;
  }
};

// ---------------------------------------------
// Maintenance helpers
// ---------------------------------------------
export const clearAddressValidationCache = () => {
  ADDRESS_VALIDATION_CACHE.clear();
  ADDRESS_COORD_CACHE.clear();
  CITY_CENTER_CACHE.clear();
  console.log("🧹 Address & geocode caches cleared");
};

export const getAddressValidationCacheStats = () => {
  return {
    validationEntries: ADDRESS_VALIDATION_CACHE.size,
    addressCoords: ADDRESS_COORD_CACHE.size,
    cityCenters: CITY_CENTER_CACHE.size,
  };
};
