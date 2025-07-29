import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

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

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={events}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek",
      }}
      eventTimeFormat={{
        hour: "numeric",
        minute: "2-digit",
        meridiem: "short", // This will show 'am'/'pm' instead of 'a'/'p'
      }}
      height="700px" // Increase height for visibility
      contentHeight="auto"
    />
  );
};

export default TransporterFullCalendar;
