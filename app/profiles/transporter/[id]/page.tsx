// app/profiles/transporter/[id]/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import TransporterProfileInfo from "@/components/TransporterProfileInfo";
import TransporterProfileFiles from "@/components/TransporterProfileFiles";
import { ArrowLeft } from "lucide-react";

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = ({ params }: ProfilePageProps) => {
  const { id } = React.use(params);
  const router = useRouter();

  const handleBack = () => {
    router.push("/transporter/dashboard");
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="btn btn-ghost btn-circle hover:bg-base-300"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
                    Transporter Profile
                  </h1>
                  <p className="text-base-content/60 mt-2">
                    View transporter information and business documents
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section - Stacked Layout */}
          <div className="space-y-6">
            {/* Profile Info Section */}
            <div>
              <TransporterProfileInfo transporterId={id} />
            </div>

            {/* Files Section */}
            <div>
              <TransporterProfileFiles transporterId={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
