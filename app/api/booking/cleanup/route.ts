// app/api/booking/cleanup/route.ts
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { paystackReference, purchaseTripId, reason } = await request.json();

    console.log("🧹 Starting cleanup:", {
      paystackReference,
      purchaseTripId,
      reason,
    });

    let cleanupCount = 0;
    let payment = null;
    let purchaseTrip = null;

    // 1. Find payment by reference if provided
    if (paystackReference) {
      try {
        payment = await convex.query(api.payments.getPaymentByReference, {
          paystackReference,
        });
        console.log("📄 Found payment:", payment?._id);
      } catch (error) {
        console.warn("⚠️ Payment not found by reference:", paystackReference);
      }
    }

    // 2. Find purchase trip (either from payment or direct ID)
    if (purchaseTripId) {
      try {
        purchaseTrip = await convex.query(api.purchasetrip.getPurchaseTrip, {
          purchaseTripId: purchaseTripId as Id<"purchaseTrip">,
        });
        console.log("🎫 Found purchase trip:", purchaseTrip?._id);
      } catch (error) {
        console.warn("⚠️ Purchase trip not found:", purchaseTripId);
      }
    } else if (payment?.purchaseTripId) {
      try {
        purchaseTrip = await convex.query(api.purchasetrip.getPurchaseTrip, {
          purchaseTripId: payment.purchaseTripId as Id<"purchaseTrip">,
        });
        console.log("🎫 Found purchase trip from payment:", purchaseTrip?._id);
      } catch (error) {
        console.warn(
          "⚠️ Purchase trip not found from payment:",
          payment.purchaseTripId
        );
      }
    }

    // 3. Cleanup purchase trip and update main trip
    if (purchaseTrip) {
      try {
        // Get the main trip to update its status
        const trip = await convex.query(api.trip.getById, {
          tripId: purchaseTrip.tripId as Id<"trip">,
        });

        if (trip) {
          // Set trip as not booked (available again)
          await convex.mutation(api.trip.setTripCancelled, {
            tripId: trip._id as Id<"trip">,
          });
          console.log("✅ Trip set to not booked:", trip._id);
        }

        // Delete the purchase trip
        await convex.mutation(
          api.purchasetrip.deletePurchaseTripByPurchaseTripId,
          {
            purchaseTripId: purchaseTrip._id as Id<"purchaseTrip">,
          }
        );
        console.log("🗑️ Deleted purchase trip:", purchaseTrip._id);
        cleanupCount++;
      } catch (error) {
        console.error("❌ Failed to cleanup purchase trip:", error);
      }
    }

    // 4. Cleanup payment record
    if (payment) {
      try {
        await convex.mutation(api.payments.deletePayment, {
          paymentId: payment._id as Id<"payments">,
        });
        console.log("🗑️ Deleted payment:", payment._id);
        cleanupCount++;
      } catch (error) {
        console.error("❌ Failed to cleanup payment:", error);
      }
    }

    const result = {
      success: true,
      cleaned: cleanupCount,
      reason: reason || "unknown",
      timestamp: new Date().toISOString(),
      details: {
        paymentCleaned: !!payment,
        purchaseTripCleaned: !!purchaseTrip,
        paystackReference,
        purchaseTripId,
      },
    };

    console.log("✅ Cleanup completed:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Cleanup failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
