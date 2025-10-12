import * as React from "react";

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  footerNote?: string;
};

export default function EmailTemplate({
  title,
  message,
  actionLabel,
  actionUrl,
  footerNote,
}: Props) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#0f172a",
        lineHeight: 1.5,
      }}
    >
      <h1 style={{ fontSize: 20, margin: 0, marginBottom: 8 }}>{title}</h1>
      <p style={{ marginTop: 0, marginBottom: 16 }}>{message}</p>
      {actionLabel && actionUrl ? (
        <a
          href={actionUrl}
          style={{
            display: "inline-block",
            padding: "10px 14px",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          {actionLabel}
        </a>
      ) : null}
      {footerNote ? (
        <p style={{ marginTop: 20, fontSize: 12, color: "#64748b" }}>
          {footerNote}
        </p>
      ) : null}
    </div>
  );
}
