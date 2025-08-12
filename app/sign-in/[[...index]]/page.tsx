"use client";
import { SignIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import RoleBasedRedirect from "@/components/RoleBasedRedirect";

const Page = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const handleBackClick = () => {
    router.push("/"); // Navigate to landing page
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (user) {
    return <RoleBasedRedirect />;
  }

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

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LL</span>
            </div>
            <span className="text-xl font-bold text-primary hidden sm:inline">
              Linkr Logistics
            </span>
          </div>

          {/* Empty div for spacing */}
          <div className="w-16"></div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-8 sm:py-16">
        <div className="w-full max-w-md">
          {/* Welcome Header */}
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
              Welcome Back
            </h1>
            <p className="text-base-content/70 text-sm sm:text-base">
              Sign in to your FreightConnect account
            </p>
          </div>

          {/* Sign In Component Container */}
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 sm:p-8">
            <SignIn
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/pending-approval"
              appearance={{
                elements: {
                  // Customize Clerk's styling to match your design
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none border-0 p-0",
                  headerTitle: "text-xl font-bold text-base-content",
                  headerSubtitle: "text-base-content/70 text-sm",
                  socialButtonsBlockButton:
                    "btn btn-outline btn-block normal-case",
                  formButtonPrimary: "btn btn-primary btn-block",
                  formFieldInput: "input input-bordered w-full",
                  formFieldLabel: "label-text font-medium",
                  dividerLine: "border-base-300",
                  dividerText: "text-base-content/60 text-sm",
                  footerActionLink: "link link-primary",
                  identityPreviewEditButton: "btn btn-sm btn-ghost",
                  formResendCodeLink: "link link-primary text-sm",
                  otpCodeFieldInput: "input input-bordered text-center",
                },
              }}
            />
          </div>

          {/* Additional Links */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-base-content/60">
              Don't have an account?{" "}
              <button
                onClick={() => router.push("/sign-up")}
                className="link link-primary font-medium"
              >
                Sign up here
              </button>
            </p>
            <p className="text-xs text-base-content/50">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
