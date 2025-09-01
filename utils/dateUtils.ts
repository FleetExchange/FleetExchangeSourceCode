/**
 * Date utilities for FleetExchange - Browser timezone independent
 *
 * Storage: All dates stored as UTC milliseconds (number) in Convex
 * Display: All dates shown to users in SAST (Africa/Johannesburg, UTC+2)
 *
 * SAST has no daylight saving time, so it's always UTC+2
 * This implementation doesn't use browser locale methods to avoid inconsistencies
 */

const SAST_OFFSET_MS = 2 * 60 * 60 * 1000; // UTC+2 (2 hours in milliseconds)

// Month names for consistent formatting
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ============================================================================
// DISPLAY FUNCTIONS - Convert UTC timestamps to human-readable SAST strings
// ============================================================================

/**
 * Get SAST date components from UTC timestamp
 * @param utcMs - UTC timestamp in milliseconds
 * @returns Object with SAST date/time components or null if invalid
 */
const getSASTComponents = (utcMs: number) => {
  if (!Number.isFinite(utcMs) || utcMs <= 0) return null;

  // Add SAST offset and use UTC methods to get the SAST wall-clock time
  const sastMs = utcMs + SAST_OFFSET_MS;
  const date = new Date(sastMs);

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(), // 0-11
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
  };
};

/**
 * Format UTC timestamp for display in SAST
 * @param utcMs - UTC timestamp in milliseconds (from DB)
 * @returns Formatted string like "05 Sep 2025, 08:00" or empty string if invalid
 */
export const formatDateTimeInSAST = (utcMs?: number | string): string => {
  if (!utcMs) return "";
  const timestamp = typeof utcMs === "string" ? Number(utcMs) : utcMs;
  const components = getSASTComponents(timestamp);
  if (!components) return "";

  const { year, month, day, hour, minute } = components;
  const dayStr = String(day).padStart(2, "0");
  const monthStr = MONTHS[month];
  const hourStr = String(hour).padStart(2, "0");
  const minuteStr = String(minute).padStart(2, "0");

  return `${dayStr} ${monthStr} ${year}, ${hourStr}:${minuteStr}`;
};

/**
 * Format UTC timestamp for date only display in SAST
 * @param utcMs - UTC timestamp in milliseconds
 * @returns Date string like "05 Sep 2025" or empty string if invalid
 */
export const formatDateInSAST = (utcMs?: number | string): string => {
  if (!utcMs) return "";
  const timestamp = typeof utcMs === "string" ? Number(utcMs) : utcMs;
  const components = getSASTComponents(timestamp);
  if (!components) return "";

  const { year, month, day } = components;
  const dayStr = String(day).padStart(2, "0");
  const monthStr = MONTHS[month];

  return `${dayStr} ${monthStr} ${year}`;
};

/**
 * Format UTC timestamp for time only display in SAST
 * @param utcMs - UTC timestamp in milliseconds
 * @returns Time string like "08:00" or empty string if invalid
 */
export const formatTimeInSAST = (utcMs?: number | string): string => {
  if (!utcMs) return "";
  const timestamp = typeof utcMs === "string" ? Number(utcMs) : utcMs;
  const components = getSASTComponents(timestamp);
  if (!components) return "";

  const { hour, minute } = components;
  const hourStr = String(hour).padStart(2, "0");
  const minuteStr = String(minute).padStart(2, "0");

  return `${hourStr}:${minuteStr}`;
};

/**
 * Format UTC timestamp for full display with day name
 * @param utcMs - UTC timestamp in milliseconds
 * @returns String like "Thursday, 05 Sep 2025 at 08:00" or empty string if invalid
 */
export const formatFullDateTimeInSAST = (utcMs?: number | string): string => {
  if (!utcMs) return "";
  const timestamp = typeof utcMs === "string" ? Number(utcMs) : utcMs;
  const components = getSASTComponents(timestamp);
  if (!components) return "";

  const { year, month, day, hour, minute } = components;

  // Calculate day of week (0 = Sunday)
  const sastDate = new Date(timestamp + SAST_OFFSET_MS);
  const dayOfWeek = sastDate.getUTCDay();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const dayName = dayNames[dayOfWeek];
  const dayStr = String(day).padStart(2, "0");
  const monthStr = MONTHS[month];
  const hourStr = String(hour).padStart(2, "0");
  const minuteStr = String(minute).padStart(2, "0");

  return `${dayName}, ${dayStr} ${monthStr} ${year} at ${hourStr}:${minuteStr}`;
};

/**
 * Format relative time in SAST for notifications
 * @param utcMs - UTC timestamp when notification was created
 * @returns String like "2 mins ago", "1 hour ago", "Yesterday", etc.
 */
export const formatRelativeTimeInSAST = (utcMs?: number | string): string => {
  if (!utcMs) return "";
  const timestamp = typeof utcMs === "string" ? Number(utcMs) : utcMs;
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "";

  const now = Date.now();
  const diffMs = now - timestamp;

  // If in the future, just show "Just now"
  if (diffMs < 0) return "Just now";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  // Less than 1 minute
  if (seconds < 60) {
    if (seconds < 10) return "Just now";
    return `${seconds} secs ago`;
  }

  // Less than 1 hour
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  }

  // Less than 1 day
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  // Less than 1 week
  if (days < 7) {
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  }

  // Less than 1 month
  if (weeks < 4) {
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  }

  // Less than 1 year
  if (months < 12) {
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  }

  // 1 year or more
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};

/**
 * Format relative time with fallback to absolute date for very old items
 * @param utcMs - UTC timestamp when notification was created
 * @param maxDaysRelative - After how many days to show absolute date (default: 7)
 * @returns String like "2 mins ago" or "15 Aug 2025" for old items
 */
export const formatRelativeTimeWithFallback = (
  utcMs?: number | string,
  maxDaysRelative: number = 7
): string => {
  if (!utcMs) return "";
  const timestamp = typeof utcMs === "string" ? Number(utcMs) : utcMs;
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "";

  const now = Date.now();
  const diffMs = now - timestamp;
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  // If older than maxDaysRelative, show absolute date
  if (days > maxDaysRelative) {
    return formatDateInSAST(timestamp);
  }

  // Otherwise show relative time
  return formatRelativeTimeInSAST(timestamp);
};

// ============================================================================
// INPUT CONVERSION - For datetime-local inputs (SAST wall-clock <-> UTC storage)
// ============================================================================

/**
 * Convert datetime-local input value (SAST wall-clock) to UTC timestamp
 * @param datetimeLocal - Input value like "2025-09-05T08:00"
 * @returns UTC timestamp in milliseconds for storage in DB
 */
export const convertSASTInputToUTC = (datetimeLocal: string): number => {
  if (!datetimeLocal || typeof datetimeLocal !== "string") return 0;

  try {
    // Parse datetime-local format: "YYYY-MM-DDTHH:MM" or "YYYY-MM-DDTHH:MM:SS"
    const [datePart, timePart = "00:00:00"] = datetimeLocal.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour = 0, minute = 0, second = 0] = timePart.split(":").map(Number);

    // Validate parsed values
    if (![year, month, day, hour, minute, second].every(Number.isFinite)) {
      console.warn("Invalid datetime-local format:", datetimeLocal);
      return 0;
    }

    // Validate ranges
    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59 ||
      second < 0 ||
      second > 59
    ) {
      console.warn("Invalid datetime values:", {
        year,
        month,
        day,
        hour,
        minute,
        second,
      });
      return 0;
    }

    // Create UTC timestamp for these wall-clock values
    const utcForSameWallClock = Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second
    );

    // Subtract SAST offset to get the actual UTC time
    // When user types "08:00 SAST", we want the UTC time that corresponds to that
    return utcForSameWallClock - SAST_OFFSET_MS;
  } catch (error) {
    console.error("Error converting SAST input to UTC:", error);
    return 0;
  }
};

/**
 * Convert UTC timestamp to datetime-local input format (SAST wall-clock)
 * @param utcMs - UTC timestamp in milliseconds (from DB)
 * @returns String like "2025-09-05T08:00" for datetime-local input value
 */
export const convertUTCToSASTInput = (utcMs?: number | string): string => {
  if (!utcMs) return "";
  const timestamp = typeof utcMs === "string" ? Number(utcMs) : utcMs;
  const components = getSASTComponents(timestamp);
  if (!components) return "";

  const { year, month, day, hour, minute } = components;
  const monthStr = String(month + 1).padStart(2, "0"); // month is 0-11, need 1-12
  const dayStr = String(day).padStart(2, "0");
  const hourStr = String(hour).padStart(2, "0");
  const minuteStr = String(minute).padStart(2, "0");

  return `${year}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}`;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current time as datetime-local input format in SAST
 * @returns String like "2025-09-05T08:30" representing current SAST time
 */
export const getCurrentSASTInputMin = (): string => {
  return convertUTCToSASTInput(Date.now());
};

/**
 * Get current UTC timestamp
 * @returns Current time as UTC milliseconds
 */
export const getCurrentUTC = (): number => {
  return Date.now();
};

/**
 * Add hours to a UTC timestamp
 * @param utcMs - UTC timestamp in milliseconds
 * @param hours - Number of hours to add
 * @returns New UTC timestamp
 */
export const addHours = (utcMs: number, hours: number): number => {
  return utcMs + hours * 60 * 60 * 1000;
};

/**
 * Add days to a UTC timestamp
 * @param utcMs - UTC timestamp in milliseconds
 * @param days - Number of days to add
 * @returns New UTC timestamp
 */
export const addDays = (utcMs: number, days: number): number => {
  return utcMs + days * 24 * 60 * 60 * 1000;
};

/**
 * Get start of day in SAST (00:00:00 SAST) as UTC timestamp
 * @param utcMs - Any UTC timestamp within the day
 * @returns UTC timestamp for start of that SAST day
 */
export const getStartOfSASTDay = (utcMs: number): number => {
  const components = getSASTComponents(utcMs);
  if (!components) return 0;

  const { year, month, day } = components;
  const startOfDayUTC = Date.UTC(year, month, day, 0, 0, 0);
  return startOfDayUTC - SAST_OFFSET_MS;
};

/**
 * Get end of day in SAST (23:59:59 SAST) as UTC timestamp
 * @param utcMs - Any UTC timestamp within the day
 * @returns UTC timestamp for end of that SAST day
 */
export const getEndOfSASTDay = (utcMs: number): number => {
  const components = getSASTComponents(utcMs);
  if (!components) return 0;

  const { year, month, day } = components;
  const endOfDayUTC = Date.UTC(year, month, day, 23, 59, 59, 999);
  return endOfDayUTC - SAST_OFFSET_MS;
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if departure date is valid (not in the past)
 * @param utcMs - UTC timestamp to validate
 * @returns true if valid, false if in the past
 */
export const isValidDepartureDate = (utcMs?: number): boolean => {
  if (!utcMs || !Number.isFinite(utcMs)) return false;

  // Allow 5 minute buffer for form completion
  const bufferMs = 5 * 60 * 1000;
  return utcMs >= Date.now() - bufferMs;
};

/**
 * Check if arrival date is after departure date
 * @param departureUtcMs - Departure UTC timestamp
 * @param arrivalUtcMs - Arrival UTC timestamp
 * @returns true if arrival is after departure
 */
export const isValidArrivalDate = (
  departureUtcMs?: number,
  arrivalUtcMs?: number
): boolean => {
  if (!departureUtcMs || !arrivalUtcMs) return false;
  if (!Number.isFinite(departureUtcMs) || !Number.isFinite(arrivalUtcMs))
    return false;

  return arrivalUtcMs > departureUtcMs;
};

/**
 * Check if a timestamp is within a date range
 * @param timestamp - UTC timestamp to check
 * @param startUtcMs - Range start (UTC)
 * @param endUtcMs - Range end (UTC)
 * @returns true if timestamp is within range (inclusive)
 */
export const isWithinDateRange = (
  timestamp: number,
  startUtcMs: number,
  endUtcMs: number
): boolean => {
  return timestamp >= startUtcMs && timestamp <= endUtcMs;
};

// ============================================================================
// DEBUG HELPERS
// ============================================================================

/**
 * Debug helper to inspect timestamp values
 * @param utcMs - UTC timestamp to debug
 * @returns Object with various representations of the timestamp
 */
export const debugTimestamp = (utcMs?: number | string) => {
  const timestamp =
    typeof utcMs === "string" ? Number(utcMs) : utcMs || Date.now();

  return {
    timestamp,
    utcISOString: Number.isFinite(timestamp)
      ? new Date(timestamp).toISOString()
      : null,
    sastDisplay: formatDateTimeInSAST(timestamp),
    sastInput: convertUTCToSASTInput(timestamp),
    sastComponents: getSASTComponents(timestamp),
    browserTZ: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isValid: Number.isFinite(timestamp) && timestamp > 0,
  };
};

/**
 * Test round-trip conversion (for debugging)
 * @param inputValue - datetime-local string to test
 * @returns Object showing conversion results
 */
export const testConversion = (inputValue: string) => {
  const utc = convertSASTInputToUTC(inputValue);
  const backToInput = convertUTCToSASTInput(utc);
  const display = formatDateTimeInSAST(utc);

  return {
    original: inputValue,
    utcTimestamp: utc,
    utcISO: new Date(utc).toISOString(),
    backToInput,
    display,
    roundTripMatches: inputValue === backToInput,
    debug: debugTimestamp(utc),
  };
};
