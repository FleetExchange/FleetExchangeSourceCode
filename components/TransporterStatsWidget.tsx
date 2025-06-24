"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Truck, DollarSign, Star, Calendar } from "lucide-react";

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

  // Calculate statistics
  const calculateStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter trips completed this month
    const tripsThisMonth =
      purchasedTrips?.filter((trip) => {
        const tripDate = new Date(trip._creationTime);
        return (
          tripDate.getMonth() === currentMonth &&
          tripDate.getFullYear() === currentYear &&
          (trip.status === "Delivered" ||
            trip.status === "Dispatched" ||
            trip.status === "Booked")
        );
      }) ?? [];

    // Calculate revenue this month (only from delivered trips)
    const revenueThisMonth = tripsThisMonth
      .filter((trip) => trip.status === "Delivered")
      .reduce((total, trip) => {
        // The price is directly in the purchaseTrip object
        return total + (trip.amount || 0);
      }, 0);

    // Calculate total completed trips (all time)
    const totalCompletedTrips =
      purchasedTrips?.filter((trip) => trip.status === "Delivered").length ?? 0;

    // Calculate average rating (mock for now - you can implement actual ratings)
    const averageRating = convexUser?.averageRating ?? 0;

    return {
      tripsThisMonth: tripsThisMonth.length,
      revenueThisMonth,
      totalCompletedTrips,
      averageRating,
    };
  };

  const stats = calculateStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatRating = (rating: number) => {
    return rating > 0 ? rating.toFixed(1) : "N/A";
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Trips This Month */}
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-figure text-primary">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="stat-title text-sm">Trips This Month</div>
          <div className="stat-value text-primary text-2xl">
            {stats.tripsThisMonth}
          </div>
          <div className="stat-desc text-xs">
            {stats.tripsThisMonth > 0 ? "Active period" : "No trips yet"}
          </div>
        </div>

        {/* Revenue This Month */}
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-figure text-success">
            <DollarSign className="w-8 h-8" />
          </div>
          <div className="stat-title text-sm">Revenue This Month</div>
          <div className="stat-value text-success text-2xl">
            {formatCurrency(stats.revenueThisMonth)}
          </div>
          <div className="stat-desc text-xs">
            {stats.revenueThisMonth > 0
              ? "From completed trips"
              : "No revenue yet"}
          </div>
        </div>

        {/* Total Completed Trips */}
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-figure text-info">
            <Truck className="w-8 h-8" />
          </div>
          <div className="stat-title text-sm">Total Completed</div>
          <div className="stat-value text-info text-2xl">
            {stats.totalCompletedTrips}
          </div>
          <div className="stat-desc text-xs">
            {stats.totalCompletedTrips > 0 ? "All-time trips" : "Get started"}
          </div>
        </div>

        {/* Average Rating */}
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-figure text-warning">
            <Star className="w-8 h-8" />
          </div>
          <div className="stat-title text-sm">Average Rating</div>
          <div className="stat-value text-warning text-2xl">
            {formatRating(stats.averageRating)}
          </div>
          <div className="stat-desc text-xs">
            {stats.averageRating > 0 ? "Client feedback" : "No ratings yet"}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-base-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">
            This Month's Performance
          </h3>
          <div className="text-xs text-base-content/70">
            {stats.tripsThisMonth > 0 ? (
              <>
                You've completed{" "}
                <span className="font-semibold">{stats.tripsThisMonth}</span>{" "}
                trips
                {stats.revenueThisMonth > 0 && (
                  <>
                    {" "}
                    earning{" "}
                    <span className="font-semibold">
                      {formatCurrency(stats.revenueThisMonth)}
                    </span>
                  </>
                )}
              </>
            ) : (
              "No trips completed this month yet"
            )}
          </div>
        </div>

        <div className="bg-base-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Business Growth</h3>
          <div className="text-xs text-base-content/70">
            {stats.totalCompletedTrips > 0 ? (
              <>
                <span className="font-semibold">
                  {stats.totalCompletedTrips}
                </span>{" "}
                total completed trips with{" "}
                <span className="font-semibold">
                  {formatRating(stats.averageRating)}
                </span>{" "}
                star rating
              </>
            ) : (
              "Start accepting trips to grow your business"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransporterStatsWidget;
