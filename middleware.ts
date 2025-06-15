import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

const isProtectedRoute = createRouteMatcher([
  "/transporter(.*)",
  "/client(.*)",
  "/admin(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/signUp(.*)",
  "/signIn(.*)",
  "/pending-approval",
  "/unauthorized",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Allow access to public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Redirect to sign-in if accessing protected route without authentication
  if (isProtectedRoute(req) && !userId) {
    return (await auth()).redirectToSignIn();
  }

  // For authenticated users on protected routes, let the components handle role checking
  return;
});
