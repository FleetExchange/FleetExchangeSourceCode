import * as React from "react";
import Logo from "./Logo";

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  footerNote?: string;

  // Optional brand overrides (safe defaults provided)
  brandName?: string;
  brandUrl?: string;
};

export default function EmailTemplate({
  title,
  message,
  actionLabel,
  actionUrl,
  footerNote,
  brandName = "FleetExchange",
  brandUrl = "https://www.fleetexchange.co.za",
}: Props) {
  // Palette (aligned to app theme)
  const colors = {
    text: "#0f172a", // slate-900
    subtext: "#334155", // slate-700
    muted: "#64748b", // slate-500
    border: "#e5e7eb", // gray-200
    bgSoft: "#f8fafc", // slate-50
    surface: "#ffffff",
    headerBg: "#0f172a", // brand dark
    primary: "#2563eb", // brand blue
    shadow: "0 10px 20px rgba(2, 6, 23, 0.06)",
  };

  const year = new Date().getFullYear();

  return (
    <div style={{ background: colors.bgSoft, padding: "24px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            color: colors.text,
          }}
        >
          <div
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              boxShadow: colors.shadow,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: colors.headerBg,
                color: "#ffffff",
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Logo variant="icon" size="lg" href="/" />
              <a
                href={brandUrl}
                style={{
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 700,
                  letterSpacing: 0.3,
                }}
              >
                {brandName}
              </a>
            </div>

            {/* Body */}
            <div style={{ padding: 24 }}>
              <h1
                style={{
                  fontSize: 22,
                  margin: 0,
                  marginBottom: 8,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </h1>

              <p
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  color: colors.subtext,
                  fontSize: 14,
                }}
              >
                {message}
              </p>

              {actionLabel && actionUrl ? (
                <a
                  href={actionUrl}
                  style={{
                    display: "inline-block",
                    padding: "12px 18px",
                    background: colors.primary,
                    color: "#ffffff",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {actionLabel}
                </a>
              ) : null}

              <hr
                style={{
                  border: 0,
                  borderTop: `1px solid ${colors.border}`,
                  margin: "24px 0",
                }}
              />

              {/* Info box (optional guidance) */}
              <div
                style={{
                  background: colors.bgSoft,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <p style={{ margin: 0, fontSize: 13, color: colors.muted }}>
                  Tip: Keep this email for your records. You can manage your
                  bookings and payments anytime on {brandName}.
                </p>
              </div>

              {footerNote ? (
                <p
                  style={{
                    marginTop: 16,
                    fontSize: 12,
                    color: colors.muted,
                  }}
                >
                  {footerNote}
                </p>
              ) : null}
            </div>

            {/* Footer */}
            <div
              style={{
                background: colors.bgSoft,
                borderTop: `1px solid ${colors.border}`,
                padding: "16px 24px",
                textAlign: "center",
                color: colors.muted,
                fontSize: 12,
              }}
            >
              © {year} {brandName}. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
