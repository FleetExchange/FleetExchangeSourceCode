// utils/dateUtils.ts
export const formatDateTimeInSAST = (dateInput: string | number | Date) => {
  const date = new Date(dateInput);

  // Format date in SAST
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
    hour12: false, // 24-hour format (standard in SA)
    timeZone: "Africa/Johannesburg",
  });

  return {
    date: sastDate,
    time: sastTime,
    fullDateTime: `${sastDate} at ${sastTime}`,
    iso: date.toISOString(),
  };
};

// Short date format for compact displays
export const formatDateInSAST = (dateInput: string | number | Date) => {
  const date = new Date(dateInput);
  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Africa/Johannesburg",
  });
};

// Time only in SAST
export const formatTimeInSAST = (dateInput: string | number | Date) => {
  const date = new Date(dateInput);
  return date.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Johannesburg",
  });
};

// Get current SAST time
export const getCurrentSASTTime = () => {
  return new Date().toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
  });
};

// For form inputs - convert user input to UTC timestamp
export const parseUserDateToUTC = (dateString: string) => {
  // Assume user input is in SAST and convert to UTC
  const sastDate = new Date(dateString + " GMT+0200");
  return sastDate.getTime();
};

// Relative time formatting (e.g., "2 hours ago")
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

  // For older dates, show full date
  return formatDateInSAST(date);
};

// Debug helper - shows all timezone info
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
