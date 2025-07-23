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
      router.push(`/profiles/transporter/${currentUser._id}`);
    }
  }, [currentUser, router]);

  return <div>Redirecting...</div>;
};

export default Page;
