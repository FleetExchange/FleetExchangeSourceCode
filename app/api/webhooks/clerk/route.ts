import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    console.log("🚨 WEBHOOK HIT!");

    const body = await req.json();
    console.log("📦 Event type:", body.type);

    if (body.type === "user.created") {
      const data = body.data;
      const metadata = data.unsafe_metadata || {};

      console.log("👤 User ID:", data.id);
      console.log("📝 Metadata:", metadata);
      console.log("✅ Profile completed?", metadata.profile_completed);
      console.log("📞 Contact number:", metadata.contact_number);

      if (metadata.profile_completed && metadata.contact_number) {
        console.log("🚀 Calling createUserFromClerk...");

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

          console.log("🎉 SUCCESS! User created:", result);
          return NextResponse.json({
            success: true,
            message: "User created successfully",
            userId: result,
          });
        } catch (error) {
          console.error("💥 Convex error:", error);
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
        console.log("⚠️ Skipping - missing required data");
        return NextResponse.json({
          success: true,
          message: "Profile not completed, user creation skipped",
        });
      }
    }

    // Handle other event types
    return NextResponse.json({
      success: true,
      message: `Event ${body.type} acknowledged`,
    });
  } catch (error) {
    console.error("💥 WEBHOOK ERROR:", error);
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

// Add GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: "Webhook endpoint is working!",
    timestamp: new Date().toISOString(),
  });
}
