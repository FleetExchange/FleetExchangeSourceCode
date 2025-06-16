"use client";
import { SignIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import RoleBasedRedirect from "@/components/RoleBasedRedirect";

const Page = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  if (user) {
    return <RoleBasedRedirect />;
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/pending-approval"
      />
    </div>
  );
};

export default Page;
