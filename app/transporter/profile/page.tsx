"use client";

import TransporterProfileInfo from "@/components/TransporterProfileInfo";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const Page = () => {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div>
      <TransporterProfileInfo transporterId={currentUser._id} />
    </div>
  );
};

export default Page;
