"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Truck,
  Star,
  BarChart3,
  Users,
} from "lucide-react";
import React from "react";

const TransporterStatsWidget = () => {
  const { user } = useUser();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get all the trips that belong to the user
  const userTrips = useQuery(api.trip.getTripsByIssuerId, {
    issuerId: convexUser?._id ?? "skip",
  });

  // Get all booked trips
  const bookedTrips = userTrips?.filter((trip) => trip.isBooked === true) ?? [];

  // Get all tripIds from the booked Trips
  const bookedTripIds = bookedTrips.map((booking) => booking._id as Id<"trip">);

  // Get all the purchaseTrips that have the bookedTripIds
  const purchasedTrips = useQuery(api.purchasetrip.getPurchaseTripByIdArray, {
    tripIds: bookedTripIds.length > 0 ? bookedTripIds : [],
  });

  // Calculate comprehensive statistics
  const calculateStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Last month calculation
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // This month's trips
    const tripsThisMonth =
      purchasedTrips?.filter((trip) => {
        const tripDate = new Date(trip._creationTime);
        return (
          tripDate.getMonth() === currentMonth &&
          tripDate.getFullYear() === currentYear &&
          trip.status === "Delivered"
        );
      }) ?? [];

    // Last month's trips
    const tripsLastMonth =
      purchasedTrips?.filter((trip) => {
        const tripDate = new Date(trip._creationTime);
        return (
          tripDate.getMonth() === lastMonth &&
          tripDate.getFullYear() === lastMonthYear &&
          trip.status === "Delivered"
        );
      }) ?? [];

    // Revenue calculations
    const revenueThisMonth = tripsThisMonth.reduce(
      (total, trip) => total + (trip.amount || 0),
      0
    );
    const revenueLastMonth = tripsLastMonth.reduce(
      (total, trip) => total + (trip.amount || 0),
      0
    );

    // Growth calculations
    const tripGrowth =
      tripsLastMonth.length > 0
        ? ((tripsThisMonth.length - tripsLastMonth.length) /
            tripsLastMonth.length) *
          100
        : tripsThisMonth.length > 0
          ? 100
          : 0;

    const revenueGrowth =
      revenueLastMonth > 0
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        : revenueThisMonth > 0
          ? 100
          : 0;

    // Total stats
    const totalCompletedTrips =
      purchasedTrips?.filter((trip) => trip.status === "Delivered").length ?? 0;
    const totalRevenue =
      purchasedTrips
        ?.filter((trip) => trip.status === "Delivered")
        .reduce((total, trip) => total + (trip.amount || 0), 0) ?? 0;

    // Year-over-year growth (simplified - last 12 months vs previous 12 months)
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const recentTrips =
      purchasedTrips?.filter((trip) => {
        const tripDate = new Date(trip._creationTime);
        return tripDate >= twelveMonthsAgo && trip.status === "Delivered";
      }) ?? [];

    const yearGrowth =
      totalCompletedTrips > recentTrips.length
        ? ((recentTrips.length - (totalCompletedTrips - recentTrips.length)) /
            Math.max(1, totalCompletedTrips - recentTrips.length)) *
          100
        : 0;

    return {
      thisMonth: {
        trips: tripsThisMonth.length,
        revenue: revenueThisMonth,
        tripGrowth,
        revenueGrowth,
      },
      lastMonth: {
        trips: tripsLastMonth.length,
        revenue: revenueLastMonth,
      },
      overall: {
        totalTrips: totalCompletedTrips,
        totalRevenue,
        averageRating: convexUser?.averageRating ?? 0,
        yearGrowth,
      },
    };
  };

  const stats = calculateStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-success" : "text-error";
  };

  return (
    <div className="lg:col-span-3 bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-base-content">
              Business Analytics
            </h2>
            <p className="text-sm text-base-content/60">
              Performance insights and growth metrics
            </p>
          </div>
        </div>
      </div>

      {/* This Month Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          This Month Performance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trips This Month */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-base-content/70 font-medium">
                    Completed Trips
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {stats.thisMonth.trips}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`flex items-center gap-1 ${getGrowthColor(stats.thisMonth.tripGrowth)}`}
                >
                  {React.createElement(
                    getGrowthIcon(stats.thisMonth.tripGrowth),
                    { className: "w-4 h-4" }
                  )}
                  <span className="text-sm font-semibold">
                    {formatPercentage(stats.thisMonth.tripGrowth)}
                  </span>
                </div>
                <p className="text-xs text-base-content/60">vs last month</p>
              </div>
            </div>
            <div className="bg-base-100/50 rounded-lg p-3">
              <p className="text-xs text-base-content/70">
                Last month:{" "}
                <span className="font-semibold">
                  {stats.lastMonth.trips} trips
                </span>
              </p>
            </div>
          </div>

          {/* Revenue This Month */}
          <div className="bg-gradient-to-br from-success/5 to-success/10 border border-success/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-base-content/70 font-medium">
                    Revenue Earned
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(stats.thisMonth.revenue)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`flex items-center gap-1 ${getGrowthColor(stats.thisMonth.revenueGrowth)}`}
                >
                  {React.createElement(
                    getGrowthIcon(stats.thisMonth.revenueGrowth),
                    { className: "w-4 h-4" }
                  )}
                  <span className="text-sm font-semibold">
                    {formatPercentage(stats.thisMonth.revenueGrowth)}
                  </span>
                </div>
                <p className="text-xs text-base-content/60">vs last month</p>
              </div>
            </div>
            <div className="bg-base-100/50 rounded-lg p-3">
              <p className="text-xs text-base-content/70">
                Last month:{" "}
                <span className="font-semibold">
                  {formatCurrency(stats.lastMonth.revenue)}
                </span>
              </p>
              <p className="text-xs text-warning/80 mt-1 font-medium">
                * Gross turnover before platform fees
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Performance Section */}
      <div>
        <h3 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-info" />
          Overall Performance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Trips */}
          <div className="bg-gradient-to-br from-info/5 to-info/10 border border-info/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-info/20 rounded-lg">
                <Truck className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-base-content/70 font-medium">
                  Total Completed
                </p>
                <p className="text-2xl font-bold text-info">
                  {stats.overall.totalTrips}
                </p>
              </div>
            </div>
            <div className="bg-base-100/50 rounded-lg p-3">
              <p className="text-xs text-base-content/70">
                Lifetime earnings:{" "}
                <span className="font-semibold">
                  {formatCurrency(stats.overall.totalRevenue)}
                </span>
              </p>
              <p className="text-xs text-warning/80 mt-1 font-medium">
                * Before platform fees
              </p>
            </div>
          </div>

          {/* Profile Rating */}
          <div className="bg-gradient-to-br from-warning/5 to-warning/10 border border-warning/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-warning/20 rounded-lg">
                <Star className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-base-content/70 font-medium">
                  Profile Rating
                </p>
                <p className="text-2xl font-bold text-warning">
                  {stats.overall.averageRating > 0
                    ? stats.overall.averageRating.toFixed(1)
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-base-100/50 rounded-lg p-3">
              <p className="text-xs text-base-content/70">
                {stats.overall.averageRating > 0
                  ? "Client feedback score"
                  : "Complete trips to get rated"}
              </p>
            </div>
          </div>

          {/* Year Growth */}
          <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-base-content/70 font-medium">
                  Year Growth
                </p>
                <p
                  className={`text-2xl font-bold ${getGrowthColor(stats.overall.yearGrowth)}`}
                >
                  {formatPercentage(stats.overall.yearGrowth)}
                </p>
              </div>
            </div>
            <div className="bg-base-100/50 rounded-lg p-3">
              <p className="text-xs text-base-content/70">
                Business growth trend over 12 months
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Insights Footer */}
      <div className="mt-8 bg-base-200/50 border border-base-300 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-base-content/60" />
          <h4 className="font-semibold text-sm text-base-content">
            Business Insights
          </h4>
        </div>
        <p className="text-xs text-base-content/70 leading-relaxed">
          {stats.thisMonth.trips > 0 ? (
            <>
              Your business is{" "}
              {stats.thisMonth.tripGrowth >= 0 ? "growing" : "adjusting"} with{" "}
              <span className="font-semibold">{stats.thisMonth.trips}</span>{" "}
              trips completed this month.{" "}
              {stats.thisMonth.revenueGrowth >= 0
                ? "Revenue is trending upward"
                : "Focus on premium routes"}{" "}
              for continued growth.
            </>
          ) : (
            "Start accepting more trips to build momentum and grow your transportation business."
          )}
        </p>
      </div>
    </div>
  );
};

export default TransporterStatsWidget;
