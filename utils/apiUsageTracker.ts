type APIType = "directions" | "geocoding" | "places" | "static_maps";

class GoogleMapsAPITracker {
  private static instance: GoogleMapsAPITracker;
  private dailyUsage = new Map<string, number>();
  private sessionUsage = new Map<APIType, number>();

  static getInstance() {
    if (!GoogleMapsAPITracker.instance) {
      GoogleMapsAPITracker.instance = new GoogleMapsAPITracker();
    }
    return GoogleMapsAPITracker.instance;
  }

  trackAPICall(apiType: APIType, details?: string) {
    const today = new Date().toDateString();
    const key = `${today}-${apiType}`;

    // Update daily usage
    const dailyCurrent = this.dailyUsage.get(key) || 0;
    this.dailyUsage.set(key, dailyCurrent + 1);

    // Update session usage
    const sessionCurrent = this.sessionUsage.get(apiType) || 0;
    this.sessionUsage.set(apiType, sessionCurrent + 1);

    // Log the API call
    console.log(
      `📍 ${apiType.toUpperCase()} API call #${dailyCurrent + 1} today (session: ${sessionCurrent + 1})${details ? ` - ${details}` : ""}`
    );

    // Warning at high usage
    if (dailyCurrent + 1 > this.getDailyLimit(apiType) * 0.8) {
      console.warn(
        `⚠️ High ${apiType} API usage: ${dailyCurrent + 1} calls today (limit: ${this.getDailyLimit(apiType)})`
      );
    }

    // Save to localStorage for persistence
    this.saveToLocalStorage();
  }

  private getDailyLimit(apiType: APIType): number {
    const limits = {
      directions: 200,
      geocoding: 100,
      places: 150,
      static_maps: 50,
    };
    return limits[apiType];
  }

  getDailyUsage(apiType: APIType): number {
    const today = new Date().toDateString();
    return this.dailyUsage.get(`${today}-${apiType}`) || 0;
  }

  getSessionUsage(apiType: APIType): number {
    return this.sessionUsage.get(apiType) || 0;
  }

  getAllDailyUsage(): Record<string, number> {
    const today = new Date().toDateString();
    const result: Record<string, number> = {};

    (["directions", "geocoding", "places", "static_maps"] as APIType[]).forEach(
      (apiType) => {
        result[apiType] = this.getDailyUsage(apiType);
      }
    );

    return result;
  }

  checkAPILimit(apiType: APIType): boolean {
    const usage = this.getDailyUsage(apiType);
    const limit = this.getDailyLimit(apiType);
    return usage < limit;
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(
        "gmaps_api_usage",
        JSON.stringify({
          daily: Object.fromEntries(this.dailyUsage),
          session: Object.fromEntries(this.sessionUsage),
          lastUpdate: new Date().toISOString(),
        })
      );
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem("gmaps_api_usage");
      if (stored) {
        const data = JSON.parse(stored);
        this.dailyUsage = new Map(Object.entries(data.daily || {}));
        // Don't restore session data - start fresh each session
      }
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  constructor() {
    this.loadFromLocalStorage();
  }

  // Method to display usage dashboard
  displayUsageDashboard() {
    const usage = this.getAllDailyUsage();
    console.table(usage);

    return usage;
  }
}

export const apiTracker = GoogleMapsAPITracker.getInstance();

// Helper functions to track specific API calls
export const trackDirectionsCall = (origin: string, destination: string) => {
  apiTracker.trackAPICall("directions", `${origin} → ${destination}`);
};

export const trackGeocodingCall = (address: string) => {
  apiTracker.trackAPICall("geocoding", address);
};

export const trackPlacesCall = (query: string) => {
  apiTracker.trackAPICall("places", query);
};

export const trackStaticMapsCall = (params: string) => {
  apiTracker.trackAPICall("static_maps", params);
};
