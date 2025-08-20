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
    // Check where user came from via referrer
    const referrer = document.referrer;

    if (referrer && referrer.includes(window.location.origin)) {
      // If they came from within our app, check if it's safe to go back
      if (!referrer.includes("/profiles/")) {
        router.back();
      } else {
        // Fallback to dashboard if coming from profiles
        router.push("/discover");
      }
    } else {
      // External referrer or direct access - go to dashboard
      router.push("/discover");
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 pl-16 lg:pl-0">
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

          {/* Content Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Profile Info - Takes 2 columns on large screens */}
            <div className="xl:col-span-2">
              <TransporterProfileInfo transporterId={id} />
            </div>

            {/* Files Section - Takes 1 column on large screens */}
            <div className="xl:col-span-1">
              <TransporterProfileFiles transporterId={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
