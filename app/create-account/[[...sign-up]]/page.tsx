"use client";
import { SignUp } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProfileData {
  role: string;
  businessName: string;
  contactNumber: string;
}

const CreateAccountPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    // Get profile data from localStorage
    const savedData = localStorage.getItem("freightConnectProfileData");

    if (!savedData) {
      // If no profile data, redirect back to signup
      router.push("/signUp");
      return;
    }

    setProfileData(JSON.parse(savedData));
  }, [router]);

  // Redirect if user is already signed in
  useEffect(() => {
    if (isLoaded && user) {
      router.push("/dashboard");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !profileData) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200 flex">
      {/* Left side - Clerk Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-base-100 rounded-lg shadow-lg p-8">
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-base-content/60 mb-2">
                <span>Step 2 of 2</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => router.push("/signUp")}
                >
                  ← Back
                </button>
              </div>
              <div className="progress progress-primary w-full">
                <div className="progress-bar" style={{ width: "100%" }}></div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6 p-4 bg-base-200 rounded-lg">
              <h3 className="font-semibold mb-2">Account Summary:</h3>
              <p className="text-sm">
                <strong>Type:</strong> {profileData.role}
              </p>
              <p className="text-sm">
                <strong>Business:</strong> {profileData.businessName}
              </p>
              <p className="text-sm">
                <strong>Contact:</strong> {profileData.contactNumber}
              </p>
            </div>

            <h1 className="text-2xl font-bold text-center mb-6">
              Create Your Account
            </h1>

            {/* Debug logging */}
            {(() => {
              console.log("=== CREATE ACCOUNT DEBUG ===");
              console.log("Profile data loaded:", profileData);
              console.log("Role:", profileData.role);
              console.log("Business name:", profileData.businessName);
              console.log("Contact:", profileData.contactNumber);
              console.log("============================");
              return null;
            })()}

            <SignUp
              path="/create-account"
              routing="path"
              signInUrl="/sign-in"
              fallbackRedirectUrl="/pending-approval" // ← Changed from afterSignUpUrl
              appearance={{
                elements: {
                  formButtonPrimary: "btn btn-primary w-full",
                  card: "bg-transparent shadow-none",
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
        </div>
      </div>

      {/* Right side - Confirmation */}
      <div className="flex-1 bg-primary text-primary-content p-8 flex items-center">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold mb-6">Almost There!</h2>
          <p className="text-lg mb-6">
            Just create your login credentials to complete your{" "}
            {profileData.role} account setup.
          </p>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">What happens next?</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-content rounded-full mr-3"></span>
                Your account will be reviewed by our team
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-content rounded-full mr-3"></span>
                You'll receive approval within 24-48 hours
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-content rounded-full mr-3"></span>
                Start using FreightConnect immediately after approval
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;
