import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const body = await req.json();

  // Only handle user.created events
  if (body.type === "user.created") {
    const data = body.data;
    const role =
      data.public_metadata?.role === "transporter" ? "transporter" : "client"; // fallback to client

    await convex.mutation(api.users.updateUser, {
      userId: data.id,
      name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
      email: data.email_addresses[0]?.email_address ?? "",
      // Optionally, you can call a dedicated createUser mutation if you prefer
      // and pass role and isApproved as well
    });

    // Optionally, update role and approval status
    await convex.mutation(api.users.updateUserRole, {
      userId: data.id,
      role,
      isApproved: false,
    });
  }

  return NextResponse.json({ success: true });
}
