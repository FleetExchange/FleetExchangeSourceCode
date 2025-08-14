// components/ClientStatsWidget.tsx
"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  MapPin,
  Calendar,
  Star,
} from "lucide-react";
import React from "react";

const ClientStatsWidget = () => {
  const { user } = useUser();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get all the purchaseTrips that belong to the user
  const userPurchaseTrips = useQuery(
    api.purchasetrip.getPurchaseTripByUserId,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  // Calculate comprehensive statistics
  const calculateStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Last month calculation
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // This month's completed trips
    const tripsThisMonth =
      userPurchaseTrips?.filter((trip) => {
        const tripDate = new Date(trip._creationTime);
        return (
          tripDate.getMonth() === currentMonth &&
          tripDate.getFullYear() === currentYear &&
          trip.status === "Delivered"
        );
      }) ?? [];

    // Last month's completed trips
    const tripsLastMonth =
      userPurchaseTrips?.filter((trip) => {
        const tripDate = new Date(trip._creationTime);
        return (
          tripDate.getMonth() === lastMonth &&
          tripDate.getFullYear() === lastMonthYear &&
          trip.status === "Delivered"
        );
      }) ?? [];

    // Spending calculations
    const spendingThisMonth = tripsThisMonth.reduce(
      (total, trip) => total + (trip.amount || 0),
      0
    );
    const spendingLastMonth = tripsLastMonth.reduce(
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

    const spendingGrowth =
      spendingLastMonth > 0
        ? ((spendingThisMonth - spendingLastMonth) / spendingLastMonth) * 100
        : spendingThisMonth > 0
          ? 100
          : 0;

    // Total stats
    const totalTrips =
      userPurchaseTrips?.filter((trip) => trip.status === "Delivered").length ??
      0;
    const totalSpending =
      userPurchaseTrips
        ?.filter((trip) => trip.status === "Delivered")
        .reduce((total, trip) => total + (trip.amount || 0), 0) ?? 0;

    // Average trip cost
    const averageTripCost = totalTrips > 0 ? totalSpending / totalTrips : 0;

    return {
      thisMonth: {
        trips: tripsThisMonth.length,
        spending: spendingThisMonth,
        tripGrowth,
        spendingGrowth,
      },
      lastMonth: {
        trips: tripsLastMonth.length,
        spending: spendingLastMonth,
      },
      overall: {
        totalTrips,
        totalSpending,
        averageTripCost,
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
    <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-base-content">
            Shipping Analytics
          </h3>
          <p className="text-sm text-base-content/60">
            Your shipping patterns and spending insights
          </p>
        </div>
      </div>

      {/* This Month Section */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-base-content mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          This Month Activity
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trips This Month */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-primary/20 rounded-lg">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-base-content/70 font-medium">
                    Shipments
                  </p>
                  <p className="text-xl font-bold text-primary">
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
                    { className: "w-3 h-3" }
                  )}
                  <span className="text-xs font-semibold">
                    {formatPercentage(stats.thisMonth.tripGrowth)}
                  </span>
                </div>
                <p className="text-xs text-base-content/60">vs last month</p>
              </div>
            </div>
            <div className="bg-base-100/50 rounded-lg p-2">
              <p className="text-xs text-base-content/70">
                Last month:{" "}
                <span className="font-semibold">{stats.lastMonth.trips}</span>
              </p>
            </div>
          </div>

          {/* Spending This Month */}
          <div className="bg-gradient-to-br from-success/5 to-success/10 border border-success/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-success/20 rounded-lg">
                  <DollarSign className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-base-content/70 font-medium">
                    Spending
                  </p>
                  <p className="text-xl font-bold text-success">
                    {formatCurrency(stats.thisMonth.spending)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`flex items-center gap-1 ${getGrowthColor(stats.thisMonth.spendingGrowth)}`}
                >
                  {React.createElement(
                    getGrowthIcon(stats.thisMonth.spendingGrowth),
                    { className: "w-3 h-3" }
                  )}
                  <span className="text-xs font-semibold">
                    {formatPercentage(stats.thisMonth.spendingGrowth)}
                  </span>
                </div>
                <p className="text-xs text-base-content/60">vs last month</p>
              </div>
            </div>
            <div className="bg-base-100/50 rounded-lg p-2">
              <p className="text-xs text-base-content/70">
                Last month:{" "}
                <span className="font-semibold">
                  {formatCurrency(stats.lastMonth.spending)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Performance Section */}
      <div>
        <h4 className="text-md font-semibold text-base-content mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-info" />
          Overall Statistics
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Trips */}
          <div className="bg-gradient-to-br from-info/5 to-info/10 border border-info/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-info/20 rounded-lg">
                <Package className="w-4 h-4 text-info" />
              </div>
              <div>
                <p className="text-xs text-base-content/70 font-medium">
                  Total Trips
                </p>
                <p className="text-lg font-bold text-info">
                  {stats.overall.totalTrips}
                </p>
              </div>
            </div>
            <div className="bg-base-100/50 rounded-lg p-2">
              <p className="text-xs text-base-content/70">
                All completed shipments
              </p>
            </div>
          </div>

          {/* Total Spending */}
          <div className="bg-gradient-to-br from-warning/5 to-warning/10 border border-warning/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-warning/20 rounded-lg">
                <DollarSign className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-xs text-base-content/70 font-medium">
                  Total Spent
                </p>
                <p className="text-lg font-bold text-warning">
                  {formatCurrency(stats.overall.totalSpending)}
                </p>
              </div>
            </div>
            <div className="bg-base-100/50 rounded-lg p-2">
              <p className="text-xs text-base-content/70">
                Lifetime shipping costs
              </p>
            </div>
          </div>

          {/* Average Cost */}
          <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-secondary/20 rounded-lg">
                <MapPin className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-base-content/70 font-medium">
                  Avg. Cost
                </p>
                <p className="text-lg font-bold text-secondary">
                  {formatCurrency(stats.overall.averageTripCost)}
                </p>
              </div>
            </div>
            <div className="bg-base-100/50 rounded-lg p-2">
              <p className="text-xs text-base-content/70">
                Per shipment average
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Footer */}
      <div className="mt-6 bg-base-200/50 border border-base-300 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-base-content/60" />
          <h5 className="font-semibold text-sm text-base-content">
            Shipping Insights
          </h5>
        </div>
        <p className="text-xs text-base-content/70 leading-relaxed">
          {stats.thisMonth.trips > 0 ? (
            <>
              You've shipped{" "}
              <span className="font-semibold">{stats.thisMonth.trips}</span>{" "}
              times this month.
              {stats.thisMonth.spendingGrowth < 0
                ? " Great job optimizing costs!"
                : " Consider bulk booking for better rates."}
            </>
          ) : (
            "Start shipping with FleetExchange to track your logistics performance and optimize costs."
          )}
        </p>
      </div>
    </div>
  );
};

export default ClientStatsWidget;
