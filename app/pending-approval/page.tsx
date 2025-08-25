"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Clock,
  Mail,
  Phone,
  CheckCircle,
  ArrowLeft,
  FileText,
  User,
} from "lucide-react";
import Logo from "@/components/Logo";
import TransporterProfileInfo from "@/components/TransporterProfileInfo";
import TransporterProfileFiles from "@/components/TransporterProfileFiles";
import ClientProfileInfo from "@/components/ClientProfileInfo";
import ClientProfileFiles from "@/components/ClientProfileFiles";

const Page = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("status");

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const handleBackClick = () => {
    router.push("/");
  };

  // Redirect if user is approved
  useEffect(() => {
    if (isLoaded && convexUser?.isApproved) {
      router.push(`/${convexUser.role}/dashboard`);
    }
  }, [isLoaded, convexUser, router]);

  // Redirect if no user
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // If user is approved, show loading while redirect happens
  if (convexUser?.isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-base-content/60">
            Account approved! Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut(() => router.push("/"));
  };

  const isTransporter = convexUser?.role === "transporter";
  const isClient = convexUser?.role === "client";

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation with Back Button */}
      <nav className="bg-base-100/80 backdrop-blur-sm border-b border-base-300 p-4">
        <div className="container mx-auto flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </button>

          {/* Centered Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            <Logo variant="icon" size="md" href="/" />
            <span className="text-xl font-bold text-secondary hidden sm:inline">
              FleetExchange
            </span>
          </div>

          {/* Empty div for spacing */}
          <div className="w-16"></div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="text-center mb-6">
              {/* Status Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-warning/20 p-6 rounded-full">
                  <Clock className="w-12 h-12 text-warning" />
                </div>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-base-content mb-2">
                Account Pending Approval
              </h1>
              <p className="text-base-content/60">
                Complete your profile while your application is being reviewed
              </p>
            </div>

            {/* Status Alert */}
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-warning mb-1">
                    Application Under Review
                  </h3>
                  <p className="text-sm text-base-content/70">
                    Your account is being reviewed by our team. This process
                    typically takes 24-48 hours. In the meantime, you can
                    complete your profile information and upload required
                    documents.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tabs tabs-boxed mb-6 bg-base-100 p-1">
            <button
              className={`tab gap-2 ${activeTab === "status" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("status")}
            >
              <Clock className="w-4 h-4" />
              Status
            </button>
            <button
              className={`tab gap-2 ${activeTab === "profile" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <User className="w-4 h-4" />
              Profile Setup
            </button>
            <button
              className={`tab gap-2 ${activeTab === "documents" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("documents")}
            >
              <FileText className="w-4 h-4" />
              Documents
            </button>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Status Tab */}
            {activeTab === "status" && (
              <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 sm:p-8">
                <div className="max-w-2xl mx-auto">
                  {/* Account Details */}
                  <div className="bg-base-200/50 rounded-xl p-6 border border-base-300 mb-6">
                    <h3 className="font-semibold text-base-content mb-4">
                      Account Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base-content/60">Email:</span>
                        <span className="font-medium">
                          {user.emailAddresses[0]?.emailAddress}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-base-content/60">Role:</span>
                        <span className="font-medium capitalize">
                          {convexUser?.role || "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-base-content/60">Status:</span>
                        <span className="badge badge-warning">
                          Pending Review
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* What happens next */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-4 text-center">
                      What happens next?
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-base-content/80">
                          Complete your profile information and upload required
                          documents
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-base-content/80">
                          Our team reviews your application and documents
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-base-content/80">
                          You'll receive an email notification once approved
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-base-content/80">
                          Full access to FleetExchange will be activated
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => window.location.reload()}
                      className="btn btn-primary w-full"
                    >
                      Refresh Status
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="btn btn-ghost w-full"
                    >
                      Sign Out
                    </button>
                  </div>

                  {/* Support Info */}
                  <div className="mt-8 bg-info/10 border border-info/20 rounded-lg p-4">
                    <h4 className="font-medium text-info mb-2">Need Help?</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-info" />
                        <span>support@fleetexchange.co.za</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-info" />
                        <span>+27 (0) 83 784 0895</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && convexUser && (
              <div>
                {isTransporter && (
                  <TransporterProfileInfo transporterId={convexUser._id} />
                )}
                {isClient && <ClientProfileInfo clientId={convexUser._id} />}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && convexUser && (
              <div>
                {isTransporter && (
                  <TransporterProfileFiles transporterId={convexUser._id} />
                )}
                {isClient && <ClientProfileFiles clientId={convexUser._id} />}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-base-content/50">
              This page will automatically redirect once your account is
              approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
