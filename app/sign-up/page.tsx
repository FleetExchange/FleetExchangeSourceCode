"use client";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RoleBasedRedirect from "@/components/RoleBasedRedirect";

const Page = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    role: "",
    businessName: "",
    contactNumber: "",
    acceptedTerms: false,
  });

  // Redirect if user is already signed in
  useEffect(() => {
    if (isLoaded && user) {
      <RoleBasedRedirect />;
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  const handleContinue = () => {
    // Save to localStorage and redirect to create-account page
    localStorage.setItem("freightConnectProfileData", JSON.stringify(formData));
    router.push("/create-account");
  };

  return (
    <div className="min-h-screen bg-base-200 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-base-100 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-6">
              Account Information
            </h1>

            {/* Role Selection */}
            <div className="mb-4">
              <label className="label">
                <span className="label-text font-medium">Account Type *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="">Select account type</option>
                <option value="client">Client - Ship Cargo</option>
                <option value="transporter">
                  Transporter - Offer Transport
                </option>
              </select>
            </div>

            {/* Business Name */}
            <div className="mb-4">
              <label className="label">
                <span className="label-text font-medium">Business Name *</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Your business name"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
              />
            </div>

            {/* Contact Number */}
            <div className="mb-4">
              <label className="label">
                <span className="label-text font-medium">Contact Number *</span>
              </label>
              <input
                type="tel"
                className="input input-bordered w-full"
                placeholder="+27 123 456 7890"
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
              />
            </div>

            {/* Terms Checkbox */}
            <div className="form-control mb-6">
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={formData.acceptedTerms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      acceptedTerms: e.target.checked,
                    })
                  }
                />
                <span className="label-text ml-2">
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>
            </div>

            {/* Continue Button */}
            <button
              className="btn btn-primary w-full"
              disabled={
                !formData.role ||
                !formData.businessName ||
                !formData.contactNumber ||
                !formData.acceptedTerms
              }
              onClick={handleContinue}
            >
              Continue to Account Creation
            </button>

            {/* Validation Message */}
            {(!formData.role ||
              !formData.businessName ||
              !formData.contactNumber ||
              !formData.acceptedTerms) && (
              <p className="text-sm text-base-content/60 text-center mt-2">
                Please fill in all fields and accept terms to continue
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Benefits */}
      <div className="flex-1 bg-primary text-primary-content p-8 flex items-center">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold mb-6">Join FreightConnect</h2>

          {formData.role === "client" && (
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

          {formData.role === "transporter" && (
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

          {!formData.role && (
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
