// utils/dateUtils.ts

/**
 * Formats a date/timestamp to SAST timezone for display
 */
export const formatDateTimeInSAST = (dateInput: string | number | Date) => {
  const date = new Date(dateInput);

  const sastDate = date.toLocaleDateString("en-ZA", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Africa/Johannesburg",
  });

  const sastTime = date.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Johannesburg",
  });

  return {
    date: sastDate,
    time: sastTime,
    fullDateTime: `${sastDate} at ${sastTime}`,
    iso: date.toISOString(),
  };
};

/**
 * Converts a datetime-local input value to UTC timestamp (number)
 * The input is assumed to be in SAST timezone
 */
export const convertSASTInputToUTC = (dateTimeLocalValue: string): number => {
  if (!dateTimeLocalValue) return 0;

  try {
    // Parse the datetime-local value as if it's in SAST
    // datetime-local format: "2024-08-25T14:30"
    const [datePart, timePart] = dateTimeLocalValue.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    // Create date in SAST timezone (UTC+2)
    // We create the date as if it's UTC, then subtract 2 hours to get actual UTC
    const sastDate = new Date(year, month - 1, day, hour, minute, 0, 0);

    // Convert SAST to UTC by subtracting 2 hours (SAST is UTC+2)
    const utcTimestamp = sastDate.getTime() - 2 * 60 * 60 * 1000;

    return utcTimestamp;
  } catch (error) {
    console.error("Error converting SAST input to UTC:", error);
    return 0;
  }
};

/**
 * Converts UTC timestamp to datetime-local input format in SAST
 */
export const convertUTCToSASTInput = (utcTimestamp: number): string => {
  if (!utcTimestamp || utcTimestamp <= 0) return "";

  try {
    // Convert UTC to SAST by adding 2 hours
    const sastTimestamp = utcTimestamp + 2 * 60 * 60 * 1000;
    const sastDate = new Date(sastTimestamp);

    // Format for datetime-local input: YYYY-MM-DDTHH:MM
    const year = sastDate.getFullYear();
    const month = String(sastDate.getMonth() + 1).padStart(2, "0");
    const day = String(sastDate.getDate()).padStart(2, "0");
    const hour = String(sastDate.getHours()).padStart(2, "0");
    const minute = String(sastDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch (error) {
    console.error("Error converting UTC to SAST input:", error);
    return "";
  }
};

/**
 * Gets the minimum datetime-local value (current time in SAST)
 */
export const getCurrentSASTInputMin = (): string => {
  const now = new Date();
  // Add 2 hours to convert UTC to SAST, then format
  const sastNow = now.getTime() + 2 * 60 * 60 * 1000;
  return convertUTCToSASTInput(now.getTime());
};

/**
 * Validates that a departure date is not in the past (SAST)
 */
export const isValidDepartureDate = (utcTimestamp: number): boolean => {
  const now = new Date();
  const departureDate = new Date(utcTimestamp);

  // Allow some buffer (5 minutes) for form completion
  const minTime = now.getTime() - 5 * 60 * 1000;

  return departureDate.getTime() >= minTime;
};

/**
 * Validates that arrival is after departure
 */
export const isValidArrivalDate = (
  departureUTC: number,
  arrivalUTC: number
): boolean => {
  if (!departureUTC || !arrivalUTC) return false;
  return arrivalUTC > departureUTC;
};

// Keep existing utility functions for backward compatibility
export const formatDateInSAST = (dateInput: string | number | Date) => {
  const date = new Date(dateInput);
  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Africa/Johannesburg",
  });
};

export const formatTimeInSAST = (dateInput: string | number | Date) => {
  const date = new Date(dateInput);
  return date.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Johannesburg",
  });
};

export const getCurrentSASTTime = () => {
  return new Date().toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
  });
};

// Legacy function - use convertSASTInputToUTC instead
export const parseUserDateToUTC = (dateString: string) => {
  return convertSASTInputToUTC(dateString);
};

export const formatRelativeTimeInSAST = (dateInput: string | number | Date) => {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return formatDateInSAST(date);
};

export const debugTimezone = (dateInput?: string | number | Date) => {
  const date = dateInput ? new Date(dateInput) : new Date();
  return {
    browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    browserTime: date.toLocaleString(),
    sastTime: date.toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" }),
    utcTime: date.toISOString(),
    timestamp: date.getTime(),
  };
};
