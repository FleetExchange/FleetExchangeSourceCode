"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
} from "@/shared/support";

const sections = [
  { id: "what-we-do", title: "1. What We Do" },
  { id: "eligibility", title: "2. Who Can Use the Platform" },
  { id: "responsibilities", title: "3. Your Responsibilities" },
  { id: "insurance", title: "4. Insurance Requirements" },
  { id: "payments", title: "5. Payments" },
  { id: "fees-taxes", title: "6. Fees & Taxes" },
  { id: "user-content", title: "7. User Content & Reviews" },
  { id: "third-party", title: "8. Third-Party Services" },
  { id: "disputes", title: "9. Disputes Between Users" },
  { id: "indemnity", title: "10. Indemnity" },
  { id: "disclaimer", title: "11. Disclaimer & Limitation of Liability" },
  { id: "availability", title: "12. Service Availability" },
  { id: "termination", title: "13. Account Suspension & Termination" },
  { id: "ip", title: "14. Intellectual Property" },
  { id: "privacy", title: "15. Privacy" },
  { id: "law", title: "16. Governing Law" },
  { id: "changes", title: "17. Changes to These Terms" },
  { id: "contact", title: "18. Contact Us" },
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

export default function TermsOfServicePage() {
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
          Effective Date: 1 October 2025 • Last Updated: 1 October 2025
        </div>
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
        FleetExchange – Terms of Service
      </h1>

      <p className="mt-4 text-sm leading-relaxed text-base-content/70 max-w-3xl">
        Welcome to FleetExchange (“the App,” “the Platform,” “we,” “us,” or
        “our”). These Terms govern use of our platform (web & mobile) and
        related services. By creating an account or using FleetExchange you
        agree to these Terms. If you do not agree, do not use the platform.
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
        <SectionWrapper id="what-we-do">
          <H2>1. What We Do</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            FleetExchange is a marketplace: transporters list trucks and routes;
            clients & transporters book cargo trips; payments may be processed
            by third‑party providers. We do not own or operate vehicles; we
            provide the connecting platform.
          </p>
        </SectionWrapper>

        <SectionWrapper id="eligibility">
          <H2>2. Who Can Use the Platform</H2>
          <p className="text-sm leading-relaxed text-base-content/80 mb-3">
            To use FleetExchange you must:
          </p>
          <ul className="space-y-2">
            <Bullet>
              Be a registered business and provide verification if requested.
            </Bullet>
            <Bullet>Provide accurate registration information.</Bullet>
            <Bullet>Have authority to enter binding agreements.</Bullet>
          </ul>
          <p className="text-xs mt-3 text-base-content/60">
            We may suspend or terminate accounts submitting false data or
            misusing the platform.
          </p>
        </SectionWrapper>

        <SectionWrapper id="responsibilities">
          <H2>3. Your Responsibilities</H2>
          <ul className="space-y-2">
            <Bullet>Use the platform only for lawful purposes.</Bullet>
            <Bullet>Avoid false, misleading, or fraudulent information.</Bullet>
            <Bullet>
              Comply with transport, safety, and payment regulations.
            </Bullet>
            <Bullet>
              Manage external contracts, deliveries, and obligations.
            </Bullet>
            <Bullet>
              Ensure drivers meet licensing, safety, cargo & transport rules.
            </Bullet>
          </ul>
        </SectionWrapper>

        <SectionWrapper id="insurance">
          <H2>4. Insurance Requirements</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            Transporters must maintain valid vehicle, cargo, and mandatory
            liability insurance per South African law and industry standards.
            FleetExchange does not verify adequacy and is not liable for
            uninsured losses.
          </p>
        </SectionWrapper>

        <SectionWrapper id="payments">
          <H2>5. Payments</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            Payments are handled by third‑party providers. A service fee may
            apply per transaction (disclosed before confirmation). We are not
            responsible for bank delays, chargebacks, or third‑party failures.
          </p>
        </SectionWrapper>

        <SectionWrapper id="fees-taxes">
          <H2>6. Fees & Taxes</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            You are responsible for all fees and taxes (VAT, income, levies)
            arising from platform use. FleetExchange does not calculate or remit
            taxes on your behalf.
          </p>
        </SectionWrapper>

        <SectionWrapper id="user-content">
          <H2>7. User Content & Reviews</H2>
          <p className="text-sm leading-relaxed text-base-content/80 mb-3">
            You are responsible for listings, messages, and reviews you post.
            You must not submit unlawful, harmful, or defamatory material.
          </p>
          <p className="text-sm leading-relaxed text-base-content/80">
            By posting, you grant us a non‑exclusive license to display and
            promote your content within the platform.
          </p>
        </SectionWrapper>

        <SectionWrapper id="third-party">
          <H2>8. Third-Party Services</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            Integrations (auth, payments, maps, etc.) are operated by third
            parties. Their performance and policies are their responsibility and
            subject to their own terms.
          </p>
        </SectionWrapper>

        <SectionWrapper id="disputes">
          <H2>9. Disputes Between Users</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            We are not a party to contracts between shippers and transporters.
            Disputes about delivery, quality, timing, or payment must be
            resolved directly. We may assist at our discretion but are not
            obligated.
          </p>
        </SectionWrapper>

        <SectionWrapper id="indemnity">
          <H2>10. Indemnity</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            You agree to indemnify FleetExchange and its affiliates against
            claims, damages, losses, liabilities, and expenses (including legal
            fees) resulting from platform use, Terms violations, or infringement
            of laws/rights.
          </p>
        </SectionWrapper>

        <SectionWrapper id="disclaimer">
          <H2>11. Disclaimer & Limitation of Liability</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            FleetExchange is a facilitator—not a carrier. We do not guarantee
            performance, safety, or quality of services listed. We are not
            liable for delays, cancellations, accidents, or losses caused by
            users. Liability (where not excluded) is limited to fees you paid us
            in the prior 3 months, to the extent permitted by law.
          </p>
        </SectionWrapper>

        <SectionWrapper id="availability">
          <H2>12. Service Availability</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            Service may be interrupted for maintenance, updates, or factors
            beyond control. We do not guarantee uninterrupted or error‑free
            operation.
          </p>
        </SectionWrapper>

        <SectionWrapper id="termination">
          <H2>13. Account Suspension & Termination</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            We may suspend or terminate accounts for violations, unlawful
            activity, fraud, or harmful conduct. You may close your account by
            contacting us at {SUPPORT_EMAIL}.
          </p>
        </SectionWrapper>

        <SectionWrapper id="ip">
          <H2>14. Intellectual Property</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            FleetExchange name, logo, and platform content belong to us. You may
            not copy, modify, or distribute without permission. You retain
            rights to your content but license us to display it.
          </p>
        </SectionWrapper>

        <SectionWrapper id="privacy">
          <H2>15. Privacy</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            Your use is subject to our Privacy Policy. Continued use signifies
            consent to described data practices.
          </p>
        </SectionWrapper>

        <SectionWrapper id="law">
          <H2>16. Governing Law</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            These Terms are governed by South African law. Disputes fall under
            the jurisdiction of courts in Cape Town.
          </p>
        </SectionWrapper>

        <SectionWrapper id="changes">
          <H2>17. Changes to These Terms</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            We may update these Terms. Material changes may be announced via
            email or in‑app notice. Continued use after changes constitutes
            acceptance.
          </p>
        </SectionWrapper>

        <SectionWrapper id="contact">
          <H2>18. Contact Us</H2>
          <div className="text-sm leading-relaxed text-base-content/80 space-y-1">
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
          </div>
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
