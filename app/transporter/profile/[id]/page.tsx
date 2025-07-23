// app/transporter/profile/[id]/page.tsx
"use client";

import React from "react";
import TransporterProfileInfo from "@/components/TransporterProfileInfo";
import TransporterProfileFiles from "@/components/TransporterProfileFiles";

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = ({ params }: ProfilePageProps) => {
  const { id } = React.use(params);

  return (
    <div className="min-h-screen pl-24 p-6 bg-base-200 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <TransporterProfileInfo transporterId={id} />
        </div>
        <div className="w-full md:w-[340px] flex-shrink-0">
          <TransporterProfileFiles transporterId={id} />
        </div>
      </div>
    </div>
  );
};

export default Page;
