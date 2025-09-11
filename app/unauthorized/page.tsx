"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, LogIn } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";

const UnauthPage = () => {
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();

  const handleSwitchAccount = async () => {
    await signOut({ redirectUrl: "/sign-in" });
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-error" />
          </div>

          <h1 className="text-2xl font-bold text-error mb-2">Access Denied</h1>
          <p className="text-base-content/70 mb-6">
            You don&apos;t have permission to view this page.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              className="btn btn-ghost gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>

            <Link href="/" className="btn btn-outline gap-2">
              <Home className="w-4 h-4" />
              Home
            </Link>

            {isSignedIn ? (
              <button
                className="btn btn-primary gap-2"
                onClick={handleSwitchAccount}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            ) : (
              <Link href="/sign-in" className="btn btn-primary gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthPage;
