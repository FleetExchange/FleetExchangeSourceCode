"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ProfilesIndex() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Map clerkId -> convex user doc (skip until we have clerk user)
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }

    // Waiting for convexUser query
    if (convexUser === undefined) return;

    if (!convexUser) {
      // Could create the user record here or show an error
      router.replace("/onboarding"); // or fallback
      return;
    }

    router.replace(`/profiles/${convexUser._id}`);
  }, [isLoaded, isSignedIn, convexUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="flex flex-col items-center gap-3">
        <div className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base-content/60 text-sm">Opening your profile...</p>
      </div>
    </div>
  );
}
