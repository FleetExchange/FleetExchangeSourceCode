import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const body = await req.json();

  if (body.type === "user.created") {
    const data = body.data;
    const metadata = data.unsafe_metadata || {};

    // Only create user if profile is completed
    if (metadata.profile_completed) {
      await convex.mutation(api.users.createUserFromClerk, {
        userId: data.id,
        name:
          metadata.business_name ||
          `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        email: data.email_addresses[0]?.email_address ?? "",
        role: metadata.role || "client",
        contactNumber: metadata.contact_number || "",
      });

      // Clear localStorage after successful creation
      console.log("User created successfully in Convex");
    } else {
      console.log("Profile not completed, skipping user creation");
    }
  }

  return NextResponse.json({ success: true });
}
