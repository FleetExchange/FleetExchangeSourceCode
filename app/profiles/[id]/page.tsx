"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import React from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function ProfileRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();

  const user = useQuery(api.users.getUserById, {
    userId: id as Id<"users">,
  });

  React.useEffect(() => {
    if (!user) return;
    if (user.role === "transporter") {
      router.replace(`/profiles/transporter/${id}`);
    } else if (user.role === "client") {
      router.replace(`/profiles/client/${id}`);
    } else {
      router.replace("/404");
    }
  }, [user, id, router]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base-content/60">Loading profile...</p>
      </div>
    </div>
  );
}
