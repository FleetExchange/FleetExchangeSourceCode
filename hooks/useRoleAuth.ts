import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export type UserRole = "client" | "transporter" | "admin";

export function useRoleAuth(requiredRole?: UserRole) {
  const { user, isLoaded: clerkLoaded } = useUser();
  const router = useRouter();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const isLoaded = clerkLoaded && convexUser !== undefined;
  const userRole = convexUser?.role as UserRole;
  const isApproved = convexUser?.isApproved;

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push("/signIn");
        return;
      }

      if (!convexUser) {
        // User exists in Clerk but not in Convex DB yet
        router.push("/pending-approval");
        return;
      }

      if (!isApproved) {
        router.push("/pending-approval");
        return;
      }

      if (requiredRole && userRole !== requiredRole) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [isLoaded, user, convexUser, userRole, isApproved, requiredRole, router]);

  return {
    user,
    convexUser,
    isLoaded,
    userRole,
    isApproved,
  };
}
