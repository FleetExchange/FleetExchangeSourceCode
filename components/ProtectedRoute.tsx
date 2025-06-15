import { useRoleAuth, UserRole } from "@/hooks/useRoleAuth";

interface ProtectedRouteProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export function ProtectedRoute({
  requiredRole,
  children,
}: ProtectedRouteProps) {
  const { isLoaded, convexUser, userRole, isApproved } =
    useRoleAuth(requiredRole);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!convexUser || !isApproved || userRole !== requiredRole) {
    return null; // useRoleAuth will handle redirects
  }

  return <>{children}</>;
}
