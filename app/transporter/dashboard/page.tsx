"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MyBookingsWidget from "@/components/MyBookingsWidget";
import TransporterStatsWidget from "@/components/TransporterStatsWidget";
import TripsInProgressWidget from "@/components/TripsInProgressWidget";
import TripToApproveWidget from "@/components/TripToApproveWidget";
import NotificationBell from "@/components/NotificationBell";
import NotificationCenter from "@/components/NotificationCenter";

const TransporterDashPage = () => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { user } = useUser();

  // Get user ID from Convex
  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const userId = userData?._id;

  // Get notifications to count unread
  const notifications =
    useQuery(api.notifications.getByUser, userId ? { userId } : "skip") ?? [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen pl-24 p-6 bg-base-200">
      {/* Notification Bell - Fixed position */}
      <div className="fixed top-6 right-6 z-50">
        <NotificationBell
          unreadCount={unreadCount}
          onClick={() => setNotificationOpen(!notificationOpen)}
        />
        {userId && (
          <NotificationCenter
            open={notificationOpen}
            onClose={() => setNotificationOpen(false)}
            userId={userId}
          />
        )}
      </div>

      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">
            Transporter Dashboard
          </h1>
          <p className="text-base-content/60 mt-2">
            Manage your trips and track your business performance
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Trips to Approve */}
          <TripToApproveWidget />

          {/* My Bookings - Full width on mobile, spans remaining space */}
          <MyBookingsWidget />
        </div>
        <div className="mb-8">
          {/* Trips in Progress - Takes 2 columns on large screens */}
          <TripsInProgressWidget />
        </div>

        {/* Stats Section */}
        <TransporterStatsWidget />
      </div>
    </div>
  );
};

export default TransporterDashPage;
