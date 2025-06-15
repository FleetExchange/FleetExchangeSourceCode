"use client";
import { SignIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push("/dashboard");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/signUp"
        afterSignInUrl="/dashboard"
      />
    </div>
  );
};

export default Page;
