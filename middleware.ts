import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

// Public routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-up(.*)",
  "/sign-in(.*)",
  "/pending-approval",
  "/unauthorized",
  "/api/webhooks(.*)",
]);

// Protected routes (auth required)
const isProtectedRoute = createRouteMatcher([
  "/transporter(.*)",
  "/client(.*)",
  "/admin(.*)",
  "/myTrips(.*)",
  "/myBookings(.*)",
  "/payment(.*)",
  "/profiles(.*)",
  "/tripClient(.*)",
  "/tripOwner(.*)",
  "/fleetManager(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const a = await auth();
  const { userId } = a;

  // Allow public
  if (isPublicRoute(req)) return NextResponse.next();

  // Block unauthenticated on protected
  if (isProtectedRoute(req) && !userId) {
    return a.redirectToSignIn();
  }

  // Everything else proceeds
  return NextResponse.next();
});
