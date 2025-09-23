import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.type === "user.created") {
      const data = body.data;
      const metadata = data.unsafe_metadata || {};

      if (metadata.profile_completed && metadata.contact_number) {
        try {
          const result = await fetchMutation(api.users.createUserFromClerk, {
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
    } else if (body.type === "user.updated") {
      const data = body.data;
      const metadata = data.unsafe_metadata || {};

      try {
        await fetchMutation(api.users.updateUserFromClerk, {
          userId: data.id,
          email: data.email_addresses[0]?.email_address ?? "",
          profileImageUrl: data.image_url ?? "",
          name:
            metadata.business_name ||
            `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        });

        return NextResponse.json({
          success: true,
          message: "User updated successfully",
        });
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update user in database",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
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
