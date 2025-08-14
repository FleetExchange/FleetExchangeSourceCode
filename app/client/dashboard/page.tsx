"use client";

import MyBookingsWidget from "@/components/MyBookingsWidget";

import NotificationBell from "@/components/NotificationBell";
import NotificationCenter from "@/components/NotificationCenter";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useState } from "react";
import { Package, Zap, BarChart3 } from "lucide-react";
import QuickActionsWidget from "@/components/QuickActionWidget";
import ClientStatsWidget from "@/components/ClientStatsWidget";

const ClientDashPage = () => {
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
            Client Dashboard
          </h1>
          <p className="text-base-content/60 mt-2">
            Manage your trips and track your shipments
          </p>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">
                Quick Actions
              </h2>
              <p className="text-sm text-base-content/60">
                Fast access to common tasks
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <QuickActionsWidget />
          </div>
        </div>

        {/* Active Bookings Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-info/10 rounded-lg border border-info/20">
              <Package className="w-6 h-6 text-info" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">
                My Bookings
              </h2>
              <p className="text-sm text-base-content/60">
                Track your current and upcoming shipments
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <MyBookingsWidget />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-success/10 rounded-lg border border-success/20">
              <BarChart3 className="w-6 h-6 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">
                Shipping Analytics
              </h2>
              <p className="text-sm text-base-content/60">
                Your shipping patterns and spending insights
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <ClientStatsWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashPage;
