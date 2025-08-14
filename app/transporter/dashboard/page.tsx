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
import { Truck, Package, BarChart3 } from "lucide-react";

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

      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">
            Transporter Dashboard
          </h1>
          <p className="text-base-content/60 mt-2">
            Manage your trips and track your business performance
          </p>
        </div>

        {/* Trip Management Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-warning/10 rounded-lg border border-warning/20">
              <Truck className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">
                Trip Management
              </h2>
              <p className="text-sm text-base-content/60">
                Approve bookings and monitor active trips
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Trips to Approve */}
            <TripToApproveWidget />

            {/* Trips in Progress */}
            <TripsInProgressWidget />
          </div>
        </div>

        {/* Booking Management Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">
                Booking Overview
              </h2>
              <p className="text-sm text-base-content/60">
                Current and upcoming trip bookings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* My Bookings - Full width */}
            <MyBookingsWidget />
          </div>
        </div>

        {/* Business Analytics Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-info/10 rounded-lg border border-info/20">
              <BarChart3 className="w-6 h-6 text-info" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">
                Business Analytics
              </h2>
              <p className="text-sm text-base-content/60">
                Performance metrics and growth insights
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Stats Section */}
            <TransporterStatsWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransporterDashPage;
