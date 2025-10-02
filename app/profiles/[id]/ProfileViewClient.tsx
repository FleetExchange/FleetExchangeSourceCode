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

function looksLikeClerkId(id: string) {
  return id.startsWith("user_");
}

interface Props {
  id: string;
}

export default function ProfileViewClient({ id }: Props) {
  const router = useRouter();

  const handleBack = () => {
    const canGoBack =
      typeof window !== "undefined" &&
      window.history.state &&
      typeof window.history.state.idx === "number" &&
      window.history.state.idx > 0;
    canGoBack ? router.back() : router.push("/discover");
  };

  // Attempt Convex doc id lookup (skip if it clearly looks like a Clerk ID)
  const userByConvexId = useQuery(
    api.users.getUserById,
    looksLikeClerkId(id) ? "skip" : { userId: id as Id<"users"> }
  );

  // Fallback: attempt Clerk ID lookup if first failed or ID looks like Clerk's
  const userByClerkId = useQuery(
    api.users.getUserByClerkId,
    userByConvexId === null || looksLikeClerkId(id) ? { clerkId: id } : "skip"
  );

  const resolvedUser = userByConvexId ?? userByClerkId;

  // Loading states
  const loading =
    userByConvexId === undefined ||
    ((looksLikeClerkId(id) || userByConvexId === null) &&
      userByClerkId === undefined);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary" />
          <p className="text-base-content/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!resolvedUser) {
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

  const role = resolvedUser.role;

  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-4xl mx-auto">
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

          <div className="space-y-6">
            {role === "client" && (
              <>
                <ClientProfileInfo clientId={resolvedUser._id} />
                <ClientProfileFiles clientId={resolvedUser._id} />
              </>
            )}
            {role === "transporter" && (
              <>
                <TransporterProfileInfo transporterId={resolvedUser._id} />
                <TransporterProfileFiles transporterId={resolvedUser._id} />
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
