"use client";

import { useRouter } from "next/navigation";
import React from "react";
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

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-base-300 px-4 py-2 text-sm hover:border-primary hover:text-primary transition-colors"
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

      <p className="mt-4 text-sm leading-relaxed text-base-content/70">
        Welcome to FleetExchange (“the App,” “the Platform,” “we,” “us,” or
        “our”). These Terms of Service (“Terms”) govern your use of our
        platform, including our desktop or mobile website, and related services.
        By creating an account or using our services, you agree to these Terms.
        If you do not agree, do not use FleetExchange.
      </p>

      {/* Mobile-friendly quick nav (collapsible on small screens if needed) */}
      <nav className="mt-6 rounded-lg border border-base-300 bg-base-100 p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
          Contents
        </div>
        <ul className="grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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

      <div className="prose prose-sm mt-10 max-w-none prose-headings:scroll-mt-24 prose-p:leading-relaxed prose-li:leading-relaxed md:prose-base">
        <section id="what-we-do">
          <h2>1. What We Do</h2>
          <p>
            FleetExchange is a marketplace where transporters can list available
            trucks and routes, and clients & transporters can book trips for
            cargo. Payments may be processed securely through third-party
            providers. We do not own or operate vehicles; we provide a platform
            that connects buyers and sellers.
          </p>
        </section>

        <section id="eligibility">
          <h2>2. Who Can Use the Platform</h2>
          <ul>
            <li>
              Be a registered business and provide verification documents when
              requested.
            </li>
            <li>Provide accurate registration information.</li>
            <li>Have legal authority to enter binding agreements.</li>
          </ul>
          <p>
            We may suspend or terminate accounts that provide false information
            or misuse the platform.
          </p>
        </section>

        <section id="responsibilities">
          <h2>3. Your Responsibilities</h2>
          <ul>
            <li>Use the platform only for lawful purposes.</li>
            <li>Not post false, misleading, or fraudulent information.</li>
            <li>
              Comply with applicable transport, safety, and payment regulations.
            </li>
            <li>
              Manage your own contracts, deliveries, and obligations outside the
              platform.
            </li>
            <li>
              Ensure drivers comply with licensing, road safety, cargo, and
              transport rules.
            </li>
          </ul>
        </section>

        <section id="insurance">
          <h2>4. Insurance Requirements</h2>
          <p>
            Transporters must maintain valid insurance for vehicles, cargo, and
            other required liabilities. Vehicles must comply with South African
            laws and industry standards. FleetExchange does not verify adequacy
            and is not responsible for uninsured losses.
          </p>
        </section>

        <section id="payments">
          <h2>5. Payments</h2>
          <p>
            Payments are processed by third-party providers. FleetExchange may
            charge a service fee per transaction (disclosed before
            confirmation). We are not responsible for delays, chargebacks, or
            third-party failures.
          </p>
        </section>

        <section id="fees-taxes">
          <h2>6. Fees & Taxes</h2>
          <p>
            You are responsible for all applicable fees and taxes (including VAT
            and income tax) related to platform usage. FleetExchange does not
            calculate or remit taxes for you.
          </p>
        </section>

        <section id="user-content">
          <h2>7. User Content & Reviews</h2>
          <p>
            You are responsible for content you post (listings, messages,
            reviews). You must not upload unlawful, harmful, or defamatory
            material. We may remove content that violates these Terms. By
            posting content, you grant us a non-exclusive license to display and
            promote it.
          </p>
        </section>

        <section id="third-party">
          <h2>8. Third-Party Services</h2>
          <p>
            The platform may integrate third parties (authentication, payments,
            maps). We are not responsible for their performance. Your use may be
            subject to their own terms.
          </p>
        </section>

        <section id="disputes">
          <h2>9. Disputes Between Users</h2>
          <p>
            We are not a party to contracts between shippers and transporters.
            Disputes (delivery, quality, delays, payments) must be resolved
            between parties. We may assist at our discretion but are not
            obligated.
          </p>
        </section>

        <section id="indemnity">
          <h2>10. Indemnity</h2>
          <p>
            You indemnify FleetExchange against claims, damages, liabilities,
            losses, or expenses (including legal fees) arising from your
            platform use, Terms violations, or legal / third-party rights
            infringements.
          </p>
        </section>

        <section id="disclaimer">
          <h2>11. Disclaimer & Limitation of Liability</h2>
          <p>
            FleetExchange is a facilitator, not a carrier. We do not guarantee
            performance, safety, or quality of listed services. We are not
            liable for delays, cancellations, accidents, or losses arising from
            user actions. Liability is limited to fees paid to us in the 3
            months preceding a claim, to the fullest extent permitted by law.
          </p>
        </section>

        <section id="availability">
          <h2>12. Service Availability</h2>
          <p>
            The platform may be unavailable due to maintenance or factors beyond
            our control. We do not guarantee uninterrupted or error-free
            operation.
          </p>
        </section>

        <section id="termination">
          <h2>13. Account Suspension & Termination</h2>
          <p>
            We may suspend or terminate accounts for Terms violations, unlawful
            use, fraud, or harmful behavior. You may close your account by
            contacting us at {SUPPORT_EMAIL}.
          </p>
        </section>

        <section id="ip">
          <h2>14. Intellectual Property</h2>
          <p>
            FleetExchange name, logo, and platform content are our property. You
            may not copy, modify, or distribute without permission. You retain
            rights to your uploaded content but grant us a license to display
            it.
          </p>
        </section>

        <section id="privacy">
          <h2>15. Privacy</h2>
          <p>
            Use of the platform is subject to our Privacy Policy. Continued use
            signifies consent to data practices described there.
          </p>
        </section>

        <section id="law">
          <h2>16. Governing Law</h2>
          <p>
            These Terms are governed by the laws of South Africa. Disputes are
            subject to the courts of Cape Town.
          </p>
        </section>

        <section id="changes">
          <h2>17. Changes to These Terms</h2>
          <p>
            We may update these Terms periodically. Material changes will be
            communicated via email or in-app notice. Continued use constitutes
            acceptance of revisions.
          </p>
        </section>

        <section id="contact">
          <h2>18. Contact Us</h2>
          <p>
            Email: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            <br />
            Phone:{" "}
            <a href={`tel:${SUPPORT_PHONE_TEL}`}>{SUPPORT_PHONE_DISPLAY}</a>
          </p>
        </section>
      </div>

      <div className="mt-16 flex flex-col gap-4 border-t border-base-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-base-300 px-4 py-2 text-sm hover:border-primary hover:text-primary transition-colors"
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
