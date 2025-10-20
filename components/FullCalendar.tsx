import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

function useIsMobile(breakpoint = 768) {
  const [is, setIs] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setIs(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange) ?? mq.addListener(onChange);
    return () =>
      mq.removeEventListener?.("change", onChange) ??
      mq.removeListener(onChange);
  }, [breakpoint]);
  return is;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  color?: string;
}

interface TransporterFullCalendarProps {
  trips?: CalendarEvent[];
  bookings?: CalendarEvent[];
}

const TransporterFullCalendar: React.FC<TransporterFullCalendarProps> = ({
  trips = [],
  bookings = [],
}) => {
  // Combine trips and bookings, set colors for distinction
  const events = [
    ...trips.map((trip) => ({
      ...trip,
      color: "#3b82f6", // blue for trips
    })),
    ...bookings.map((booking) => ({
      ...booking,
      color: "#22c55e", // green for bookings
    })),
  ];

  const isMobile = useIsMobile();

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView={isMobile ? "timeGridWeek" : "dayGridMonth"}
      events={events}
      headerToolbar={
        isMobile
          ? { left: "prev,next", center: "title", right: "today" }
          : {
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek",
            }
      }
      dayHeaderFormat={
        isMobile
          ? { weekday: "short", month: "numeric", day: "numeric" }
          : { weekday: "short" }
      }
      eventTimeFormat={{
        hour: "numeric",
        minute: "2-digit",
        meridiem: "short",
      }}
      height={isMobile ? "auto" : 700}
      contentHeight={isMobile ? "auto" : undefined}
      aspectRatio={isMobile ? 0.9 : 1.6}
      expandRows
      dayMaxEventRows
      moreLinkClick="popover"
    />
  );
};

export default TransporterFullCalendar;
