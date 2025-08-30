"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { release } from "os";
import React from "react";
import { useState } from "react";
import { formatDateInSAST } from "@/utils/dateUtils";

export type TripStatus =
  | "Awaiting Confirmation"
  | "Booked"
  | "Dispatched"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

interface StatusAdvanceButtonProps {
  currentStatus: TripStatus;
  purchaseTripId: Id<"purchaseTrip">;
}

const StatusAdvanceButton = ({
  currentStatus,
  purchaseTripId,
}: StatusAdvanceButtonProps) => {
  const [status, setStatus] = useState<TripStatus>(currentStatus);
  const updateStatus = useMutation(api.purchasetrip.updatePurchaseTripStatus);

  // Add query to keep status in sync
  const purchaseTrip = useQuery(api.purchasetrip.getPurchaseTrip, {
    purchaseTripId,
  });

  // Get the user
  const client = useQuery(
    api.users.getUserById,
    purchaseTrip?.userId
      ? {
          userId: purchaseTrip?.userId as Id<"users">,
        }
      : "skip"
  );

  // get trip oject
  const trip = useQuery(
    api.trip.getById,
    purchaseTrip?.tripId
      ? {
          tripId: purchaseTrip?.tripId as Id<"trip">,
        }
      : "skip"
  );

  // create mutation
  const createNotification = useMutation(api.notifications.createNotification);
  const getPaymentByTrip = useQuery(
    api.payments.getPaymentByTrip,
    trip?._id ? { tripId: trip._id } : "skip"
  );

  // Add these new queries/mutations
  const getPayoutAccount = useQuery(
    api.payoutAccount.getByUser,
    trip?.userId ? { userId: trip.userId } : "skip"
  );

  // Mutations for payment handling
  const updatePaymentStatus = useMutation(api.payments.updatePaymentStatus);
  const requestPayment = useMutation(api.payments.requestPayment);

  // Update local state when database changes
  React.useEffect(() => {
    if (purchaseTrip?.status) {
      setStatus(purchaseTrip.status as TripStatus);
    }
  }, [purchaseTrip?.status]);

  const getNextStatus = (current: TripStatus): TripStatus => {
    switch (current) {
      case "Awaiting Confirmation":
        return "Booked";
      case "Booked":
        return "Dispatched";
      case "Dispatched":
        return "Delivered";
      case "Delivered":
      default:
        return current;
    }
  };

  const handleAdvanceStatus = async () => {
    try {
      const nextStatus = getNextStatus(status);

      // capture previous status so we can rollback on failure
      const prevStatus = status;
      // 1. Update status in database
      await updateStatus({
        purchaseTripId,
        newStatus: nextStatus,
      });

      // 2. Handle payment charging for if a trip is accepted and the next status is "Booked"
      if (nextStatus === "Booked") {
        try {
          // 2.1 Get payment (from hook)
          const payment = getPaymentByTrip;

          if (!payment) {
            console.warn("No payment record found for this trip.");
          } else if (payment.status === "pending") {
            // Call paystack api
            const res = await fetch("/api/paystack/initialize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: payment?._id, // Your API expects this
                email: client?.email || undefined,
                amountZar: payment.totalAmount, // Use ZAR instead of kobo
                metadata: {
                  paymenntId: payment?._id,
                  purchaseTripId: payment.purchaseTripId,
                },
              }),
            });

            if (res.ok) {
              const resJson = await res.json();
              // Support multiple possible shapes returned by the initialize endpoint
              const authUrl =
                (resJson as any)?.authorization_url ||
                (resJson as any)?.data?.authorization_url ||
                (resJson as any)?.raw?.authorization_url;

              const paystackReference =
                (resJson as any)?.reference ||
                (resJson as any)?.data?.reference ||
                (resJson as any)?.raw?.reference;

              // If server returned an authorization_url, send via notification
              if (authUrl) {
                // Call server-side mutation updates the payment row.
                const requestpayment = await requestPayment({
                  paymentId: payment._id,
                  authorizationUrl: authUrl,
                  reference: paystackReference || "",
                });

                // notify customer in-app (server/webhook will mark charged later)
                await createNotification({
                  userId: payment.userId,
                  type: "paymentRequest",
                  message:
                    "Your booking was accepted — please complete payment within 24 hours by following the link.",
                  meta: {
                    purchaseTripId,
                    paymentId: payment._id,
                    url: authUrl,
                  },
                });
              } else {
                console.warn(
                  "requestPayment succeeded but no authorization_url returned."
                );
              }
            } else {
              // Read response text for better logs
              const raw = await res.text().catch(() => "");
              console.error("Paystack initialization failed:", res.status, raw);
              // mark payment as failed (best-effort)
              try {
                await updatePaymentStatus({
                  paymentId: payment._id,
                  status: "pending",
                });
              } catch (e) {
                console.warn("Failed to mark payment request_failed:", e);
              }
              // rollback purchaseTrip status
              try {
                await updateStatus({
                  purchaseTripId,
                  newStatus: prevStatus,
                });
              } catch (e) {
                console.warn("Failed to rollback purchaseTrip status:", e);
              }

              // notify both parties
              try {
                await createNotification({
                  userId: purchaseTrip?.userId as Id<"users">,
                  type: "booking",
                  message:
                    "We could not create a payment request for your booking. Please try again or contact support.",
                  meta: { purchaseTripId, action: "payment_request_failed" },
                });
                await createNotification({
                  userId: trip?.userId as Id<"users">,
                  type: "trip",
                  message:
                    "Payment request for your booking failed. Please retry creating the payment link.",
                  meta: { purchaseTripId, action: "payment_request_failed" },
                });
              } catch (e) {
                console.warn("Failed to send failure notifications:", e);
              }

              // surface to UI
              alert(
                "Failed to create payment request. The booking status has been reverted. Please try again."
              );
              return;
            }
          } else if (payment.status === "payment_requested") {
            // Already requested: re-send notification or open existing link
            const url = payment.paymentRequestUrl;
            if (url) {
              await createNotification({
                userId: payment.userId,
                type: "paymentRequest",
                message:
                  "Payment is already requested for your booking. Please complete it within 24 hours.",
                meta: { purchaseTripId, paymentId: payment._id, url },
              });
            }
          } else {
            // other statuses: authorized/charged/forfeited etc.
            console.log(
              "Payment status is",
              payment.status,
              "- no payment request needed."
            );
          }
        } catch (error) {
          console.error("Failed to request payment:", error);
          // best-effort rollback & notify
          try {
            // mark payment if available
            const payment = getPaymentByTrip;
            if (payment?._id) {
              await updatePaymentStatus({
                paymentId: payment._id,
                status: "pending",
              });
            }
            await updateStatus({
              purchaseTripId,
              newStatus: prevStatus,
            });
            alert("Failed to create payment request. Please try again.");
          } catch (e) {
            console.warn(
              "Rollback after payment request failure also failed:",
              e
            );
          }
          return;
        }
      }

      // 3. Handle payment release for "Delivered" status
      if (nextStatus === "Delivered") {
        await releasePaymentToTransporter();
        await createNotification({
          userId: purchaseTrip?.userId as Id<"users">,
          type: "booking",
          message: `Please rate your experience for your booking from ${trip?.originCity} to ${trip?.destinationCity}.`,
          meta: {
            tripId: trip?._id as Id<"trip">,
            action: "rating_request",
          },
        });
      }

      setStatus(nextStatus); // Update local state immediately

      // Updated to use SAST formatting utility
      const formattedDate = trip?.departureDate
        ? formatDateInSAST(trip.departureDate)
        : "TBD";

      // Send the notification of status change
      await createNotification({
        userId: purchaseTrip?.userId as Id<"users">,
        type: "booking",
        message: `Booking Status Update: ${formattedDate} ${trip?.originCity} - ${trip?.destinationCity}: ${nextStatus}.`,
        meta: {
          tripId: trip?._id as Id<"trip">,
          action: "status_update",
        },
      });
    } catch (error) {
      console.error("Failed to advance status:", error);
    }
  };

  const releasePaymentToTransporter = async () => {
    try {
      console.log("Starting payment release process...");

      // 1. Get payment details
      const payment = getPaymentByTrip;
      if (!payment) {
        throw new Error("Payment not found");
      }

      // 2. Get transporter's payout account
      const payoutAccount = getPayoutAccount;
      if (!payoutAccount?.paystackRecipientCode) {
        throw new Error(
          "Transporter bank details not found. Please ask transporter to add bank details."
        );
      }

      // 4. Create transfer via API
      const transferResponse = await fetch("/api/paystack/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payment.transporterAmount * 100,
          recipientCode: payoutAccount.paystackRecipientCode,
          reason: `Payment for trip from ${trip?.originCity} to ${trip?.destinationCity}`,
          reference: `transfer-${payment._id}-${Date.now()}`,
          metadata: {
            tripId: trip?._id,
            purchaseTripId: purchaseTripId,
            paymentId: payment._id,
          },
        }),
      });

      const transferData = await transferResponse.json();

      if (transferData.status) {
        // 5. Update payment status in database
        await updatePaymentStatus({
          paymentId: payment._id,
          status: "released",
          transferReference: transferData.data.reference,
        });

        // 6. Notify transporter
        await createNotification({
          userId: trip?.userId as Id<"users">,
          type: "payment",
          message: `Payment of R${payment.transporterAmount} has been released to your bank account for the completed trip.`,
          meta: {
            tripId: trip?._id as Id<"trip">,
            action: "payment_released",
            amount: payment.transporterAmount,
          },
        });

        console.log("Payment released successfully!");
      } else {
        throw new Error(transferData.message || "Transfer failed");
      }
    } catch (error) {
      console.error("Payment release failed:", error);

      // Notify about the error
      await createNotification({
        userId: trip?.userId as Id<"users">,
        type: "payment",
        message: `Payment release failed: ${error instanceof Error ? error.message : "Unknown error"}. Your request will be processed manually. Please contact support for further questions.`,
        meta: {
          tripId: trip?._id as Id<"trip">,
          action: "payment_release_failed",
        },
      });
    }
  };

  // Don't show button if status is already Delivered
  if (status === "Delivered") {
    return null;
  }

  if (status === "Cancelled") {
    return (
      <div className="py-2 px-4 rounded bg-red-100 text-red-700 text-center font-semibold">
        This trip has been <span className="font-bold">Cancelled</span>.
      </div>
    );
  }
  if (status === "Refunded") {
    return (
      <div className="py-2 px-4 rounded bg-yellow-100 text-yellow-700 text-center font-semibold">
        This trip has been <span className="font-bold">Refunded</span>.
      </div>
    );
  }
  return (
    <button
      onClick={handleAdvanceStatus}
      className="btn btn-primary btn-sm flex flex-col items-center gap-1 py-2 h-auto min-h-[3rem]"
    >
      <span className="text-xs opacity-80">Current Status: {status}</span>
      <span className="font-medium">Advance to {getNextStatus(status)}</span>
    </button>
  );
};

export default StatusAdvanceButton;
