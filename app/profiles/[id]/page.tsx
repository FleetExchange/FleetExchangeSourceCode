"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft } from "lucide-react";

import ClientProfileInfo from "@/components/ClientProfileInfo";
import ClientProfileFiles from "@/components/ClientProfileFiles";
import TransporterProfileInfo from "@/components/TransporterProfileInfo";
import TransporterProfileFiles from "@/components/TransporterProfileFiles";

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const handleBack = () => {
    const canGoBack =
      typeof window !== "undefined" &&
      window.history.state &&
      typeof window.history.state.idx === "number" &&
      window.history.state.idx > 0;
    canGoBack ? router.back() : router.push("/discover");
  };

  // Fetch minimal user to decide which components to mount
  const user = useQuery(api.users.getUserById, {
    userId: id as Id<"users">,
  });

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary" />
          <p className="text-base-content/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-6">
        <div className="max-w-sm text-center space-y-4">
          <h1 className="text-xl font-semibold text-base-content">
            Profile Not Found
          </h1>
          <p className="text-sm text-base-content/60">
            The requested user does not exist or is unavailable.
          </p>
          <button
            onClick={() => router.push("/discover")}
            className="btn btn-primary btn-sm"
          >
            Go to Discover
          </button>
        </div>
      </div>
    );
  }

  const role = user.role; // "client" | "transporter" | others

  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBack}
                className="btn btn-ghost btn-circle hover:bg-base-300"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
                  {role === "client"
                    ? "Client Profile"
                    : role === "transporter"
                      ? "Transporter Profile"
                      : "User Profile"}
                </h1>
                <p className="text-base-content/60 text-sm mt-1">
                  Viewing {role} information
                </p>
              </div>
            </div>
          </div>

          {/* Content (components internally enforce access) */}
          <div className="space-y-6">
            {role === "client" && (
              <>
                <ClientProfileInfo clientId={user._id} />
                <ClientProfileFiles clientId={user._id} />
              </>
            )}
            {role === "transporter" && (
              <>
                <TransporterProfileInfo transporterId={user._id} />
                <TransporterProfileFiles transporterId={user._id} />
              </>
            )}
            {role !== "client" && role !== "transporter" && (
              <div className="alert alert-warning">
                <span>Unsupported role: {role}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
