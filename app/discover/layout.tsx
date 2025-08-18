"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ClientSidebar from "@/components/ClientSidebar";
import TransporterSidebar from "@/components/TransporterSidebar";
import MobileMenuClient from "@/components/MobileMenuClient";
import MobileMenuTransporter from "@/components/MobileMenuTransporter";

export default function DiscoverLayout({
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

  // Render appropriate sidebar based on user role
  const renderSidebar = () => {
    switch (convexUser.role) {
      case "client":
        return (
          <>
            <div className="hidden lg:block">
              <ClientSidebar />
            </div>
            <MobileMenuClient />
          </>
        );

      case "transporter":
        return (
          <>
            <div className="hidden lg:block">
              <TransporterSidebar />
            </div>

            <MobileMenuTransporter />
          </>
        );
      default:
        return (
          <div className="w-64 bg-base-100 min-h-screen flex items-center justify-center">
            <p className="text-base-content/60">Unknown role</p>
          </div>
        );
    }
  };

  return (
    <>
      {renderSidebar()}
      {/* Main Content */}
      <main className="lg:ml-20">{children}</main>
    </>
  );
}
