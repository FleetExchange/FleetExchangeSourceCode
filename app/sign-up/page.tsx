"use client";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import RoleBasedRedirect from "@/components/RoleBasedRedirect";
import Logo from "@/components/Logo";

const Page = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    role: "",
    businessName: "",
    contactNumber: "",
    acceptedTerms: false,
  });

  const handleBackClick = () => {
    router.push("/");
  };

  // Redirect if user is already signed in
  useEffect(() => {
    if (isLoaded && user) {
      router.push("/sign-in");
      return;
    }
  }, [isLoaded, user, router]);

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

  const handleContinue = () => {
    localStorage.setItem("fleetExchangeProfileData", JSON.stringify(formData));
    router.push("/create-account");
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
        {/* Left side - Form */}
        <div className="flex items-center justify-center px-4 py-8 sm:py-16">
          <div className="w-full max-w-md">
            {/* Progress Header */}
            <div className="text-center mb-6 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-base-content/60">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  1
                </div>
                <div className="w-8 h-1 bg-base-300"></div>
                <div className="w-8 h-8 bg-base-300 rounded-full flex items-center justify-center text-base-content/60 text-xs font-bold">
                  2
                </div>
              </div>
              <p className="text-xs text-base-content/60">Step 1 of 2</p>
            </div>

            {/* Welcome Header */}
            <div className="text-center mb-8 space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
                Create Your Account
              </h1>
              <p className="text-base-content/70 text-sm sm:text-base">
                Join FleetExchange and start connecting
              </p>
            </div>

            {/* Form Container */}
            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 sm:p-8">
              <form className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Account Type *
                  </label>
                  <select
                    className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Your business name"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+27 123 456 7890"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactNumber: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary mt-1"
                    checked={formData.acceptedTerms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        acceptedTerms: e.target.checked,
                      })
                    }
                  />
                  <label className="text-sm text-base-content/80 leading-relaxed">
                    I agree to the{" "}
                    <a href="/TermsOfService" className="link link-primary">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/PrivacyPolicy" className="link link-primary">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Continue Button */}
                <button
                  type="button"
                  className="btn btn-primary w-full btn-lg"
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
                  <p className="text-xs text-base-content/60 text-center">
                    Please fill in all fields and accept terms to continue
                  </p>
                )}
              </form>
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

        {/* Right side - Benefits */}
        <div className="bg-primary text-primary-content p-8 lg:p-16 flex items-center">
          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8">
              Join FleetExchange
            </h2>

            {/* Dynamic content based on role */}
            {formData.role === "client" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">As a Client, you can:</h3>
                <div className="space-y-4">
                  {[
                    "Find reliable transport for your cargo",
                    "Track shipments in real-time",
                    "Compare prices and services",
                    "Secure payment processing",
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-content rounded-full flex-shrink-0"></div>
                      <span className="text-primary-content/90">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.role === "transporter" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">
                  As a Transporter, you can:
                </h3>
                <div className="space-y-4">
                  {[
                    "Grow your transport business",
                    "Manage your fleet efficiently",
                    "Connect with clients nationwide",
                    "Receive secure payments",
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-content rounded-full flex-shrink-0"></div>
                      <span className="text-primary-content/90">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!formData.role && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">
                  Why Choose FleetExchange?
                </h3>
                <div className="space-y-4">
                  {[
                    "Secure and reliable platform",
                    "Real-time tracking and updates",
                    "Competitive pricing",
                    "24/7 customer support",
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-content rounded-full flex-shrink-0"></div>
                      <span className="text-primary-content/90">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mission Statement */}
            <div className="mt-10 p-6 bg-primary-content/10 rounded-xl border border-primary-content/20">
              <p className="text-primary-content/90 italic text-center">
                "Our mission is to provide instantaneous & reliable logistic
                solutions ensuring you have peace of mind"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
