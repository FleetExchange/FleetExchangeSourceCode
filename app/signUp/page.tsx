"use client";
import { SignUp } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<
    "client" | "transporter" | ""
  >("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Redirect if user is already signed in
  useEffect(() => {
    if (isLoaded && user) {
      // You could also check their role and redirect to specific dashboard
      router.push("/dashboard"); // or wherever your main app is
    }
  }, [isLoaded, user, router]);

  // Show loading while checking auth status
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Don't render signup form if user is signed in
  if (user) {
    return null; // or a loading spinner while redirecting
  }

  return (
    <div className="min-h-screen bg-base-200 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-base-100 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-6">
              Create Account
            </h1>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="label">
                <span className="label-text font-medium">Account Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedRole}
                onChange={(e) =>
                  setSelectedRole(e.target.value as "client" | "transporter")
                }
              >
                <option value="">Select account type</option>
                <option value="client">Client - Ship Cargo</option>
                <option value="transporter">
                  Transporter - Offer Transport
                </option>
              </select>
            </div>

            {/* Terms Checkbox */}
            <div className="form-control mb-6">
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span className="label-text ml-2">
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>
            </div>

            {/* Clerk SignUp Component */}
            {selectedRole && acceptedTerms && (
              <SignUp
                path="/signUp"
                routing="path"
                signInUrl="/signIn"
                afterSignUpUrl="/pending-approval"
                appearance={
                  {
                    /* ... */
                  }
                }
                // Pass selectedRole as public metadata
                unsafeMetadata={{
                  role: selectedRole,
                }}
              />
            )}

            {(!selectedRole || !acceptedTerms) && (
              <div className="text-center text-base-content/60">
                Please select an account type and accept terms to continue
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Benefits */}
      <div className="flex-1 bg-primary text-primary-content p-8 flex items-center">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold mb-6">Join FreightConnect</h2>

          {selectedRole === "client" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">As a Client, you can:</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-content rounded-full mr-3"></span>
                  Find reliable transport for your cargo
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-content rounded-full mr-3"></span>
                  Track shipments in real-time
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-content rounded-full mr-3"></span>
                  Compare prices and services
                </li>
              </ul>
            </div>
          )}

          {selectedRole === "transporter" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                As a Transporter, you can:
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-content rounded-full mr-3"></span>
                  Grow your transport business
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-content rounded-full mr-3"></span>
                  Manage your fleet efficiently
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-content rounded-full mr-3"></span>
                  Connect with clients nationwide
                </li>
              </ul>
            </div>
          )}

          {!selectedRole && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                Why Choose FreightConnect?
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-content rounded-full mr-3"></span>
                  Secure and reliable platform
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-content rounded-full mr-3"></span>
                  Real-time tracking and updates
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-content rounded-full mr-3"></span>
                  Competitive pricing
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
