import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

type UsePlacesOpts = {
  cityName?: string;
  citiesOnly?: boolean;
  debounceMs?: number;
};

const PREDICTION_CACHE = new Map<
  string,
  google.maps.places.AutocompletePrediction[]
>();

export const usePlacesWithRestrictions = ({
  cityName,
  citiesOnly = false,
  debounceMs = 500,
}: UsePlacesOpts) => {
  const [coords, setCoords] = useState({ lat: -26.2041, lng: 28.0473 }); // Johannesburg default
  const lastQueryRef = useRef<string>("");

  // Get city center only when cityName changes
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!cityName) return;
      try {
        const results = await getGeocode({
          address: `${cityName}, South Africa`,
        });
        const { lat, lng } = await getLatLng(results[0]);
        if (active) setCoords({ lat, lng });
      } catch {
        /* fallback silently */
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [cityName]);

  const requestOptions = useMemo(
    () => ({
      componentRestrictions: { country: "za" as const },
      location: new google.maps.LatLng(coords.lat, coords.lng),
      radius: 50000,
      ...(citiesOnly && { types: ["(cities)"] }),
    }),
    [coords.lat, coords.lng, citiesOnly]
  );

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue: rawSetValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions,
    debounce: debounceMs,
  });

  // Wrap setValue with guards
  const setValue = useCallback(
    (val: string) => {
      const trimmed = val.trim();
      if (trimmed.length === 0) {
        lastQueryRef.current = "";
        rawSetValue("", false);
        return;
      }
      if (trimmed.length < 3) {
        // Do not query; clear UI suggestions but keep value
        rawSetValue(trimmed, false);
        return;
      }
      if (trimmed === lastQueryRef.current) {
        return; // avoid duplicate identical call
      }
      const cacheKey = `${citiesOnly ? "C" : "A"}|${cityName || "-"}|${trimmed.toLowerCase()}`;
      if (PREDICTION_CACHE.has(cacheKey)) {
        // Inject cached predictions (hack: we cannot push into library internals cleanly;
        // consumer will filter again)
        lastQueryRef.current = trimmed;
        rawSetValue(trimmed, false);
        return;
      }
      lastQueryRef.current = trimmed;
      rawSetValue(trimmed, true);
    },
    [cityName, citiesOnly, rawSetValue]
  );

  // Cache predictions
  useEffect(() => {
    const q = value.trim();
    if (status === "OK" && q.length >= 3) {
      const cacheKey = `${citiesOnly ? "C" : "A"}|${cityName || "-"}|${q.toLowerCase()}`;
      if (!PREDICTION_CACHE.has(cacheKey)) {
        PREDICTION_CACHE.set(cacheKey, data);
      }
    }
  }, [status, data, value, cityName, citiesOnly]);

  const filteredSuggestions = useMemo(
    () =>
      citiesOnly
        ? data.filter((s) =>
            s.types.some(
              (t) => t === "locality" || t === "administrative_area_level_2"
            )
          )
        : data,
    [data, citiesOnly]
  );

  return {
    ready,
    value,
    status,
    suggestions: filteredSuggestions,
    setValue,
    clearSuggestions,
    coords,
  };
};
