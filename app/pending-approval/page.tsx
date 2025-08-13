"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Clock, Mail, Phone, CheckCircle, ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

const Page = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
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
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-73px)]">
        {/* Left side - Status */}
        <div className="flex items-center justify-center px-4 py-8 sm:py-16">
          <div className="w-full max-w-md">
            {/* Status Header */}
            <div className="text-center mb-8 space-y-4">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="bg-warning/20 p-6 rounded-full">
                  <Clock className="w-16 h-16 text-warning" />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
                Account Pending Approval
              </h1>
              <p className="text-base-content/70 text-sm sm:text-base">
                Your application is being reviewed
              </p>
            </div>

            {/* Status Card */}
            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 sm:p-8 space-y-6">
              {/* User Info */}
              <div className="bg-base-200/50 rounded-xl p-4 border border-base-300">
                <h3 className="font-semibold text-base-content mb-3 text-sm">
                  Account Details:
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Email:</span>
                    <span className="font-medium">
                      {user.emailAddresses[0]?.emailAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Role:</span>
                    <span className="font-medium capitalize">
                      {convexUser?.role || "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Status:</span>
                    <span className="badge badge-warning">Pending Review</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="text-center">
                <p className="text-base-content/80 leading-relaxed">
                  Thank you for signing up! Your account is currently under
                  review by our team. This process typically takes{" "}
                  <strong>24-48 hours</strong>.
                </p>
              </div>

              {/* What happens next */}
              <div>
                <h3 className="font-semibold mb-4 text-center">
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
            </div>

            {/* Footer */}
            <p className="text-xs text-base-content/50 mt-6 text-center">
              This page will automatically redirect once your account is
              approved.
            </p>
          </div>
        </div>

        {/* Right side - Support */}
        <div className="bg-primary text-primary-content p-8 lg:p-16 flex items-center">
          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8">Need Help?</h2>

            <div className="space-y-6">
              <p className="text-xl text-primary-content/90">
                Our support team is here to help with any questions during the
                approval process.
              </p>

              {/* Contact Methods */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Get in Touch:</h3>

                <div className="bg-primary-content/10 rounded-xl p-4 border border-primary-content/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-primary-content" />
                    <span className="font-medium">Email Support</span>
                  </div>
                  <p className="text-primary-content/80 text-sm">
                    support@fleetexchange.co.za
                  </p>
                </div>

                <div className="bg-primary-content/10 rounded-xl p-4 border border-primary-content/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-5 h-5 text-primary-content" />
                    <span className="font-medium">Phone Support</span>
                  </div>
                  <p className="text-primary-content/80 text-sm">
                    +27 (0) 83 784 0895
                  </p>
                  <p className="text-primary-content/60 text-xs mt-1">
                    Monday - Friday: 8:00 AM - 6:00 PM SAST
                  </p>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Common Questions:</h3>
                <div className="space-y-3">
                  <div className="bg-primary-content/5 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-1">
                      How long does approval take?
                    </h4>
                    <p className="text-primary-content/80 text-sm">
                      Most applications are approved within 24-48 hours.
                    </p>
                  </div>
                  <div className="bg-primary-content/5 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-1">
                      What do you review?
                    </h4>
                    <p className="text-primary-content/80 text-sm">
                      We verify business details and ensure platform safety.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="mt-10 p-6 bg-primary-content/10 rounded-xl border border-primary-content/20">
              <p className="text-primary-content/90 italic text-center">
                "Our mission is to provide Fast, Instantaneous & reliable
                logistic solutions ensuring you have peace of mind"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
