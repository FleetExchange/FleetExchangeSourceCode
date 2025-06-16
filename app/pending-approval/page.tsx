"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Clock, Mail, Phone, CheckCircle } from "lucide-react";
import RoleBasedRedirect from "@/components/RoleBasedRedirect";

const Page = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Redirect if user is approved
  useEffect(() => {
    if (isLoaded && convexUser?.isApproved) {
      router.push(`/${convexUser.role}/dashboard`); // ✅ Redirect properly
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
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // If user is approved, show loading while redirect happens
  if (convexUser?.isApproved) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-base-100 rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-warning/20 p-4 rounded-full">
              <Clock className="w-12 h-12 text-warning" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-base-content mb-4">
            Account Pending Approval
          </h1>

          {/* User Info */}
          <div className="bg-base-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-base-content/70 mb-2">
              Account Details:
            </p>
            <p className="font-medium">
              {user.emailAddresses[0]?.emailAddress}
            </p>
            <p className="text-sm text-base-content/70 capitalize">
              Role: {convexUser?.role || "Not set"}
            </p>
          </div>

          {/* Message */}
          <p className="text-base-content/80 mb-6 leading-relaxed">
            Thank you for signing up! Your account is currently under review by
            our team. This process typically takes 1-2 business days.
          </p>

          {/* What happens next */}
          <div className="text-left mb-6">
            <h3 className="font-semibold mb-3 text-center">
              What happens next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-base-content/80">
                  Our team reviews your application
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
                  Full access to FreightConnect will be activated
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-info/10 border border-info/20 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-info mb-2">Need help?</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4 text-info" />
                <span>support@freightconnect.com</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4 text-info" />
                <span>+27 (0) 11 123 4567</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary w-full"
            >
              Check Status
            </button>
            <button onClick={handleSignOut} className="btn btn-ghost w-full">
              Sign Out
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-base-content/50 mt-6">
            This page will automatically redirect once your account is approved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
