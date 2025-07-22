"use client";

import TransporterProfileInfo from "@/components/TransporterProfileInfo";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import TransporterProfileFiles from "@/components/TransporterProfileFiles";

const Page = () => {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="min-h-screen pl-24 p-6 bg-base-200 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        {/* Profile Info - take 2/3 width on desktop */}
        <div className="flex-1 min-w-0">
          <TransporterProfileInfo transporterId={currentUser._id} />
        </div>
        {/* Business Documents - take 1/3 width on desktop */}
        <div className="w-full md:w-[340px] flex-shrink-0">
          <TransporterProfileFiles transporterId={currentUser._id} />
        </div>
      </div>
    </div>
  );
};

export default Page;
