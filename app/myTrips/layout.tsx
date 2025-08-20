"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import TransporterSidebar from "@/components/TransporterSidebar";
import MobileMenuTransporter from "@/components/MobileMenuTransporter";

export default function MyTripLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoaded } = useUser();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Show loading while user data is being fetched
  if (!isLoaded || !convexUser) {
    return (
      <div className="flex">
        <div className="w-64 bg-base-100 min-h-screen flex items-center justify-center">
          <div className="loading loading-spinner loading-md"></div>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // Only allow transporters to access fleet manager
  if (convexUser.role !== "transporter") {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="bg-base-100 rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-error mb-4">Access Denied</h1>
          <p className="text-base-content/60">
            Fleet Manager is only available for transporters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="hidden lg:block pr-10">
        <TransporterSidebar />
      </div>

      <MobileMenuTransporter />

      <main className="flex-1">{children}</main>
    </div>
  );
}
