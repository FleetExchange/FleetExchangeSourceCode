// Create a component: components/RoleBasedRedirect.tsx
"use client";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoleBasedRedirect() {
  const { user } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState("Checking account...");

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // if a transporter then run the transporter check account setup mutation
  const transporterSetupCheck = useMutation(
    api.notifications.checkTransporterAccountSetup
  );
  // if a client then run the client check account setup mutation
  const clientSetupCheck = useMutation(
    api.notifications.checkClientAccountSetup
  );

  useEffect(() => {
    // Only proceed if we have both user and convexUser data loaded
    if (!user) return;

    // If convexUser is still loading (undefined), don't do anything yet
    if (convexUser === undefined) {
      setStatus("Loading account data...");
      return;
    }

    // If convexUser is null, account doesn't exist
    if (convexUser === null) {
      setStatus("Account not found. Redirecting...");
      router.push("/unauthorized");
      return;
    }

    // Now we have valid convexUser data
    if (convexUser.isApproved) {
      setStatus("Account approved! Redirecting to dashboard...");

      // if a transporter then run the transporter check account setup mutation
      if (convexUser.role === "transporter") {
        transporterSetupCheck({ userId: convexUser._id });
      }

      // if a client then run the client check account setup mutation
      if (convexUser.role === "client") {
        clientSetupCheck({ userId: convexUser._id });
      }

      //Redirect based on role
      router.push(`/${convexUser.role}/dashboard`);
    } else {
      setStatus("Account pending approval. Redirecting...");
      router.push("/pending-approval");
    }
  }, [user, convexUser, router, transporterSetupCheck, clientSetupCheck]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <p className="text-base-content/60">{status}</p>
      </div>
    </div>
  );
}
