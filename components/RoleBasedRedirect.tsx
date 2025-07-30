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

  useEffect(() => {
    if (user && convexUser) {
      if (convexUser.isApproved) {
        setStatus("Account approved! Redirecting to dashboard...");

        // if a transporter then run the transporter check account setup mutation
        if (convexUser.role === "transporter") {
          console.log(
            "Triggering transporter setup check for user:",
            convexUser._id
          );
          transporterSetupCheck({ userId: convexUser._id });
        }

        // if a client then run the client check account setup mutation

        //Redirect based on role
        router.push(`/${convexUser.role}/dashboard`);
      } else {
        setStatus("Account pending approval. Redirecting...");
        router.push("/pending-approval");
      }
    } else if (user && convexUser === null) {
      setStatus("Account not found. Redirecting...");
      router.push("/unauthorized");
    }
  }, [user, convexUser, router, transporterSetupCheck]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <p className="text-base-content/60">{status}</p>
      </div>
    </div>
  );
}
