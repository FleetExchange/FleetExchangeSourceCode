"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import React from "react";
import { Id } from "@/convex/_generated/dataModel";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

const Page = ({ params }: ProfilePageProps) => {
  const router = useRouter();
  const { id } = React.use(params);

  // Fetch user by id
  const user = useQuery(api.users.getUserById, { userId: id as Id<"users"> });

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

  return <div>Redirecting to profile...</div>;
};

export default Page;
