export const isAddressWithinRange = async (
  address: string,
  cityName: string,
  maxDistanceKm: number = 100 // Maximum allowed distance from city center
): Promise<boolean> => {
  try {
    // Get coordinates for both locations
    const geocoder = new google.maps.Geocoder();

    const [addressResult, cityResult] = await Promise.all([
      geocoder.geocode({ address }),
      geocoder.geocode({ address: `${cityName}, South Africa` }),
    ]);

    if (!addressResult.results[0] || !cityResult.results[0]) {
      return false;
    }

    // Calculate distance between points
    const addressLocation = addressResult.results[0].geometry.location;
    const cityLocation = cityResult.results[0].geometry.location;

    const distanceInMeters =
      google.maps.geometry.spherical.computeDistanceBetween(
        addressLocation,
        cityLocation
      );

    const distanceInKm = distanceInMeters / 1000;
    return distanceInKm <= maxDistanceKm;
  } catch (error) {
    console.error("Error validating address distance:", error);
    return false;
  }
};
