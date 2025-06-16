import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.type === "user.created") {
      const data = body.data;
      const metadata = data.unsafe_metadata || {};

      if (metadata.profile_completed && metadata.contact_number) {
        try {
          const result = await convex.mutation(api.users.createUserFromClerk, {
            userId: data.id,
            name:
              metadata.business_name ||
              `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            email: data.email_addresses[0]?.email_address ?? "",
            role: metadata.role || "client",
            contactNumber: metadata.contact_number,
          });

          return NextResponse.json({
            success: true,
            message: "User created successfully",
            userId: result,
          });
        } catch (error) {
          return NextResponse.json(
            {
              success: false,
              error: "Failed to create user in database",
              details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json({
          success: true,
          message: "Profile not completed, user creation skipped",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Event ${body.type} acknowledged`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Webhook endpoint is working!",
    timestamp: new Date().toISOString(),
  });
}
