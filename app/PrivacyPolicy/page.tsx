"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
} from "@/shared/support";

const sections = [
  { id: "info-we-collect", title: "1. Information We Collect" },
  { id: "use-of-info", title: "2. How We Use Your Information" },
  { id: "international", title: "3. International Data Transfers" },
  { id: "third-parties", title: "4. Third-Party Services" },
  { id: "popia-rights", title: "5. Your Rights Under POPIA" },
  { id: "security", title: "6. Security of Your Information" },
  { id: "retention", title: "7. Data Retention" },
  { id: "contact", title: "8. Contact Us" },
  { id: "changes", title: "9. Changes to This Policy" },
];

function SectionWrapper({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-b border-base-200 last:border-none pb-8 last:pb-0"
    >
      {children}
    </section>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight mb-3 text-base-content">
      {children}
    </h2>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="pl-4 relative">
      <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
      <span className="text-sm leading-relaxed text-base-content/80">
        {children}
      </span>
    </li>
  );
}

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-base-300 bg-base-100 px-4 py-2 text-sm hover:border-primary hover:text-primary transition-colors"
        >
          ← Back
        </button>
        <div className="text-xs text-base-content/60">
          Effective Date: 1 October 2025
        </div>
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
        Privacy Policy
      </h1>

      <p className="mt-4 text-sm leading-relaxed text-base-content/70 max-w-3xl">
        FleetExchange (“we,” “our,” or “us”) is committed to protecting your
        privacy. This Privacy Policy explains how we collect, use, and safeguard
        your information when you use our website, mobile applications, and
        related services (“Services”). By using the Services, you agree to this
        Policy.
      </p>

      {/* TOC */}
      <div className="mt-6">
        <div className="md:hidden mb-3">
          <button
            onClick={() => setTocOpen((o) => !o)}
            className="text-xs uppercase tracking-wide rounded-md border border-base-300 px-3 py-2 inline-flex items-center gap-2 hover:border-primary hover:text-primary transition-colors"
          >
            Contents {tocOpen ? "▲" : "▼"}
          </button>
        </div>
        <nav
          className={`rounded-lg border border-base-300 bg-base-100 p-4 ${
            tocOpen ? "block" : "hidden md:block"
          }`}
        >
          <ul className="grid gap-2 text-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded px-2 py-1 hover:bg-base-200 hover:text-primary transition-colors"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-10 space-y-10">
        <SectionWrapper id="info-we-collect">
          <H2>1. Information We Collect</H2>
          <p className="text-sm leading-relaxed text-base-content/80 mb-3">
            We collect information to operate and improve the platform:
          </p>
          <ul className="space-y-2">
            <Bullet>
              <span className="font-medium text-base-content">
                Personal Information:
              </span>{" "}
              Name, email, phone, billing and voluntarily provided data.
            </Bullet>
            <Bullet>
              <span className="font-medium text-base-content">
                Account & Usage Data:
              </span>{" "}
              Preferences, session activity, interactions.
            </Bullet>
            <Bullet>
              <span className="font-medium text-base-content">
                Device & Technical Data:
              </span>{" "}
              IP, browser, OS, diagnostics.
            </Bullet>
            <Bullet>
              <span className="font-medium text-base-content">
                Location Data:
              </span>{" "}
              If enabled, approximate or precise location for service features.
            </Bullet>
          </ul>
        </SectionWrapper>

        <SectionWrapper id="use-of-info">
          <H2>2. How We Use Your Information</H2>
          <ul className="space-y-2">
            <Bullet>Provide, maintain, and improve Services.</Bullet>
            <Bullet>Process payments and transactions.</Bullet>
            <Bullet>Facilitate bookings, trip, and fleet operations.</Bullet>
            <Bullet>Send notices, updates, and support messages.</Bullet>
            <Bullet>Comply with legal and regulatory obligations.</Bullet>
          </ul>
        </SectionWrapper>

        <SectionWrapper id="international">
          <H2>3. International Data Transfers</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            Data may be stored/processed in jurisdictions outside your country
            (including those with different protections). We apply safeguards
            consistent with applicable laws (including POPIA).
          </p>
        </SectionWrapper>

        <SectionWrapper id="third-parties">
          <H2>4. Third-Party Services</H2>
          <p className="text-sm leading-relaxed text-base-content/80 mb-3">
            We may use trusted providers under contractual obligations:
          </p>
          <ul className="space-y-2">
            <Bullet>Payment processing</Bullet>
            <Bullet>Hosting & infrastructure</Bullet>
            <Bullet>Analytics & monitoring</Bullet>
          </ul>
          <p className="text-xs mt-3 text-base-content/60">
            These parties act on our behalf and follow confidentiality controls.
          </p>
        </SectionWrapper>

        <SectionWrapper id="popia-rights">
          <H2>5. Your Rights Under POPIA</H2>
          <ul className="space-y-2">
            <Bullet>Request access to your personal information.</Bullet>
            <Bullet>Request correction or deletion.</Bullet>
            <Bullet>Object to or restrict certain processing.</Bullet>
            <Bullet>Lodge a complaint with the Information Regulator.</Bullet>
          </ul>
          <p className="text-sm leading-relaxed text-base-content/70 mt-3">
            To exercise rights, use the contact details in Section 8.
          </p>
        </SectionWrapper>

        <SectionWrapper id="security">
          <H2>6. Security of Your Information</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            We apply reasonable technical and organizational safeguards. No
            method is completely secure; residual risk remains.
          </p>
        </SectionWrapper>

        <SectionWrapper id="retention">
          <H2>7. Data Retention</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            We retain data only as needed to deliver Services, comply with law,
            and resolve disputes. When no longer required it is deleted or
            anonymized.
          </p>
        </SectionWrapper>

        <SectionWrapper id="contact">
          <H2>8. Contact Us</H2>
          <div className="text-sm leading-relaxed text-base-content/80 space-y-1">
            <p className="font-medium text-base-content">FleetExchange</p>
            <p>
              Email:{" "}
              <a
                className="text-primary hover:underline"
                href={`mailto:${SUPPORT_EMAIL}`}
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
            <p>
              Phone:{" "}
              <a
                className="text-primary hover:underline"
                href={`tel:${SUPPORT_PHONE_TEL}`}
              >
                {SUPPORT_PHONE_DISPLAY}
              </a>
            </p>
            <p>
              Registered Address: 6 Jacksons Terrace, 81 Buitenkant Street,
              Gardens, Cape Town
            </p>
          </div>
        </SectionWrapper>

        <SectionWrapper id="changes">
          <H2>9. Changes to This Policy</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            We may update this Policy. Significant changes will be notified in
            app or by email. Continued use after updates constitutes acceptance.
          </p>
        </SectionWrapper>
      </div>

      {/* Footer */}
      <div className="mt-16 flex flex-col gap-4 border-t border-base-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-base-300 bg-base-100 px-4 py-2 text-sm hover:border-primary hover:text-primary transition-colors"
        >
          ← Back
        </button>
        <div className="text-xs text-base-content/50">
          © {new Date().getFullYear()} FleetExchange. All rights reserved.
        </div>
      </div>
    </div>
  );
}
