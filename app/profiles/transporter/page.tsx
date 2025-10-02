"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
  const { user } = useUser();
  const router = useRouter();
  const currentUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  useEffect(() => {
    if (currentUser?._id) {
      router.replace(`/profiles/transporter/${currentUser._id}`);
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-base-content/60">Loading profile...</p>
      </div>
    </div>
  );
};

export default Page;
