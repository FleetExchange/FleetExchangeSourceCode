"use client";
import { SignUp } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import RoleBasedRedirect from "@/components/RoleBasedRedirect";
import Logo from "@/components/Logo";

interface ProfileData {
  role: string;
  businessName: string;
  contactNumber: string;
}

const CreateAccountPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const handleBackClick = () => {
    router.push("/sign-up");
  };

  useEffect(() => {
    // Get profile data from localStorage
    const savedData = localStorage.getItem("fleetExchangeProfileData");

    if (!savedData) {
      // If no profile data, redirect back to signup
      router.push("/sign-up");
      return;
    }

    setProfileData(JSON.parse(savedData));
  }, [router]);

  // Redirect if user is already signed in
  useEffect(() => {
    if (isLoaded && user) {
      router.push("/sign-in");
      return;
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (user) {
    return null;
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
            <span className="hidden sm:inline">Back to Sign Up</span>
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
        {/* Left side - Form */}
        <div className="flex items-center justify-center px-4 py-8 sm:py-16">
          <div className="w-full max-w-md">
            {/* Progress Header */}
            <div className="text-center mb-6 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-base-content/60">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white text-xs font-bold">
                  ✓
                </div>
                <div className="w-8 h-1 bg-success"></div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  2
                </div>
              </div>
              <p className="text-xs text-base-content/60">Step 2 of 2</p>

              <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
                Create Your Account
              </h1>
              <p className="text-base-content/70 text-sm sm:text-base">
                Set up your login credentials
              </p>
            </div>

            {/* Account Summary */}
            <div className="bg-base-200/50 rounded-xl p-4 mb-6 border border-base-300">
              <h3 className="font-semibold text-base-content mb-3 text-sm">
                Account Summary:
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-base-content/60">Type:</span>
                  <span className="font-medium capitalize">
                    {profileData.role === "client"
                      ? "Client - Ship Cargo"
                      : "Transporter - Offer Transport"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Business:</span>
                  <span className="font-medium">
                    {profileData.businessName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Contact:</span>
                  <span className="font-medium">
                    {profileData.contactNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Sign Up Component Container */}
            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 sm:p-8">
              <SignUp
                path="/create-account"
                routing="path"
                signInUrl="/sign-in"
                fallbackRedirectUrl="/pending-approval"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none border-0 p-0",
                    headerTitle: "text-xl font-bold text-base-content",
                    headerSubtitle: "text-base-content/70 text-sm",
                    socialButtonsBlockButton:
                      "btn btn-outline btn-block normal-case",
                    formButtonPrimary: "btn btn-primary btn-block",
                    formFieldInput:
                      "input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    formFieldLabel: "label-text font-medium",
                    dividerLine: "border-base-300",
                    dividerText: "text-base-content/60 text-sm",
                    footerActionLink: "link link-primary",
                    identityPreviewEditButton: "btn btn-sm btn-ghost",
                    formResendCodeLink: "link link-primary text-sm",
                    otpCodeFieldInput:
                      "input input-bordered text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  },
                }}
                unsafeMetadata={{
                  role: profileData.role,
                  business_name: profileData.businessName,
                  contact_number: profileData.contactNumber,
                  profile_completed: true,
                }}
              />
            </div>

            {/* Additional Links */}
            <div className="text-center mt-6 space-y-2">
              <p className="text-sm text-base-content/60">
                Already have an account?{" "}
                <button
                  onClick={() => router.push("/sign-in")}
                  className="link link-primary font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - What's Next */}
        <div className="bg-primary text-primary-content p-8 lg:p-16 flex items-center">
          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8">
              Almost There!
            </h2>

            <div className="space-y-6">
              <p className="text-xl text-primary-content/90">
                Just create your login credentials to complete your{" "}
                <span className="font-semibold">
                  {profileData.role === "client" ? "Client" : "Transporter"}
                </span>{" "}
                account setup.
              </p>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold">What happens next?</h3>
                <div className="space-y-4">
                  {[
                    "Your account will be reviewed by our team",
                    "You'll receive approval within 24-48 hours",
                    "Start using FleetExchange immediately after approval",
                    "Access to all premium features included",
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-content/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-content font-bold text-sm">
                          {i + 1}
                        </span>
                      </div>
                      <span className="text-primary-content/90">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="mt-10 p-6 bg-primary-content/10 rounded-xl border border-primary-content/20">
              <p className="text-primary-content/90 italic text-center">
                "Our mission is to provide Instantaneous & Reliable logistic
                solutions ensuring you have Peace of Mind"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;
