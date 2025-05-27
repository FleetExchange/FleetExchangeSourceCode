import { useState, useEffect } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

interface Coordinates {
  lat: number;
  lng: number;
}

interface PlacesHookProps {
  cityName: string | undefined;
  defaultCoords?: Coordinates;
  citiesOnly?: boolean; // New prop to control city-only mode
}

export const usePlacesWithRestrictions = ({
  cityName,
  defaultCoords = { lat: -26.2041, lng: 28.0473 },
  citiesOnly = false, // Default to false for backward compatibility
}: PlacesHookProps) => {
  const [coords, setCoords] = useState<Coordinates>(defaultCoords);

  const getCityCoordinates = async (city: string) => {
    try {
      const results = await getGeocode({
        address: `${city}, South Africa`,
      });
      return getLatLng(results[0]);
    } catch (error) {
      console.error("Error getting coordinates for city:", error);
      return defaultCoords;
    }
  };

  useEffect(() => {
    if (cityName) {
      getCityCoordinates(cityName).then(setCoords);
    }
  }, [cityName]);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "za" },
      location: new google.maps.LatLng(coords.lat, coords.lng),
      radius: 50000,
      // Add types restriction only if citiesOnly is true
      ...(citiesOnly && { types: ["(cities)"] }),
    },
  });

  // Filter suggestions if citiesOnly is true
  const filteredSuggestions = citiesOnly
    ? data.filter((suggestion) =>
        suggestion.types.some(
          (type) =>
            type === "locality" || type === "administrative_area_level_2"
        )
      )
    : data;

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
