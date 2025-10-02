"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ClientProfileInfo from "@/components/ClientProfileInfo";
import ClientProfileFiles from "@/components/ClientProfileFiles";
import { ArrowLeft } from "lucide-react";

export default function ClientProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();

  const handleBack = () => {
    const canGoBack =
      typeof window !== "undefined" &&
      window.history.state &&
      typeof window.history.state.idx === "number" &&
      window.history.state.idx > 0;

    canGoBack ? router.back() : router.push("/discover");
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-4xl mx-auto">
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
                    Client Profile
                  </h1>
                  <p className="text-base-content/60 mt-2">
                    View client information and business documents
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <ClientProfileInfo clientId={id} />
            <ClientProfileFiles clientId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
