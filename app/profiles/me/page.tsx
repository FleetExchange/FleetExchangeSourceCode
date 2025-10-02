import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function MyProfile() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const convexUser = await fetchQuery(api.users.getUserByClerkId, {
    clerkId: userId,
  });
  if (!convexUser) redirect("/pending-approval");

  redirect(`/profiles/${convexUser._id}`);
}
