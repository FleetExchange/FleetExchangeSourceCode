import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { render } from "@react-email/render";
import EmailTemplate from "@/components/EmailTemplate";
import { title } from "process";

async function sendWithResend(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = "no-reply@fleetexchange.co.za";
  if (!key) throw new Error("RESEND_API_KEY missing");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok)
    throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
}

function subjectForType(type: string) {
  switch (type) {
    case "booking":
      return "Booking Update from FleetExchange";
    case "trip":
      return "Trip Update from FleetExchange";
    case "payment":
      return "Payment Update from FleetExchange";
    case "paymentRequest":
      return "Payment Request from FleetExchange";
    case "account":
      return "Account Notification from FleetExchange";
    case "system":
      return "System Notification from FleetExchange";
    default:
      return "Notification from FleetExchange";
  }
}

export const sendForNotification = action({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const notification = await ctx.runQuery(api.internal.getNotificationById, {
      id: notificationId,
    });
    if (!notification) return;

    const user = await ctx.runQuery(api.internal.getUserByIdSafe, {
      userId: notification.userId,
    });
    if (!user?.email) return;

    const subject = subjectForType(notification.type);

    // Derive CTA from metadata with sensible defaults for payment requests
    const ctaUrl = notification.meta?.url || null;
    const ctaLabel =
      notification.type === "paymentRequest" && ctaUrl ? "Pay Now" : undefined;

    const html = render(
      EmailTemplate({
        title: subject,
        message: notification.message,
        actionLabel: ctaLabel,
        actionUrl: ctaUrl || undefined, // button only renders if both are set
        footerNote:
          "You are receiving this because you have notifications enabled.",
      })
    );

    await sendWithResend(user.email, subject, await html);
  },
});
