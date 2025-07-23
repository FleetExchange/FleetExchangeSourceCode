"use client";

import React, { useState } from "react";
import { format, addMonths, eachDayOfInterval } from "date-fns";

type CalendarTrip = {
  id: string;
  type: "trip" | "booking";
  title: string;
  start: Date;
  end: Date;
};

interface TripCalendarProps {
  trips: CalendarTrip[];
}

const COLORS = {
  trip: "bg-blue-400",
  booking: "bg-green-400",
};

const TripCalendar: React.FC<TripCalendarProps> = ({ trips }) => {
  // Month navigation state
  const [month, setMonth] = useState(new Date());

  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  // Build days for the month
  const days = eachDayOfInterval({ start: startOfMonth, end: endOfMonth });

  // Helper: get trips for a day
  const getTripsForDay = (day: Date) =>
    trips.filter(
      (trip) =>
        day >= trip.start &&
        day <= trip.end &&
        trip.start.getMonth() === month.getMonth() &&
        trip.start.getFullYear() === month.getFullYear()
    );

  // Helper: get block length for a trip
  const getBlockLength = (trip: CalendarTrip) =>
    Math.min(
      (trip.end.getTime() - trip.start.getTime()) / (1000 * 60 * 60 * 24) + 1,
      days.length - trip.start.getDate() + 1
    );

  return (
    <div className="bg-base-100 rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{format(month, "MMMM yyyy")}</h2>
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setMonth(addMonths(month, -1))}
          >
            &lt; Prev
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setMonth(addMonths(month, 1))}
          >
            Next &gt;
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {/* Weekday headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-center font-semibold text-base-content/70"
          >
            {d}
          </div>
        ))}
        {/* Calendar days */}
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="h-24 border border-base-300 rounded-lg relative overflow-visible"
          >
            <div className="absolute top-1 left-2 text-xs text-base-content/60">
              {format(day, "d")}
            </div>
            {/* Trip/Booking blocks */}
            <div className="absolute inset-0 flex flex-col gap-1">
              {getTripsForDay(day).map((trip) => {
                // Only render block on the start day
                if (
                  format(day, "yyyy-MM-dd") !== format(trip.start, "yyyy-MM-dd")
                )
                  return null;
                const blockLength = getBlockLength(trip);
                return (
                  <div
                    key={trip.id}
                    className={`${COLORS[trip.type]} text-white px-2 py-1 rounded shadow text-xs font-medium absolute`}
                    style={{
                      left: 0,
                      right: 0,
                      top: "1.5rem",
                      width: `calc(${blockLength} * 100% + (${blockLength - 1} * 2px))`,
                      zIndex: 2,
                    }}
                  >
                    {trip.title}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-6">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-blue-400 inline-block" /> Trip
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-green-400 inline-block" /> Booking
        </span>
      </div>
    </div>
  );
};

export default TripCalendar;
