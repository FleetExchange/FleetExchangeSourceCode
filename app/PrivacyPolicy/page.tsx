"use client";

import React from "react";
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

export default function PrivacyPolicyPage() {
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
          Effective Date: 1 October 2025
        </div>
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
        Privacy Policy
      </h1>

      <p className="mt-4 text-sm leading-relaxed text-base-content/70">
        FleetExchange (“we,” “our,” or “us”) is committed to protecting your
        privacy. This Privacy Policy explains how we collect, use, and safeguard
        your information when you use our website, mobile applications, and
        related services (“Services”). By using the Services, you agree to this
        Policy.
      </p>

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

      <div className="prose prose-sm mt-10 max-w-none md:prose-base prose-headings:scroll-mt-24 prose-p:leading-relaxed prose-li:leading-relaxed">
        <section id="info-we-collect">
          <h2>1. Information We Collect</h2>
          <p>We may collect:</p>
          <ul>
            <li>
              <strong>Personal Information:</strong> Name, email, phone number,
              billing details, and any data you provide.
            </li>
            <li>
              <strong>Account & Usage Data:</strong> Credentials, preferences,
              interaction logs.
            </li>
            <li>
              <strong>Device & Technical Data:</strong> IP address, browser
              type, OS, usage logs.
            </li>
            <li>
              <strong>Location Data:</strong> GPS or similar (if enabled).
            </li>
          </ul>
        </section>

        <section id="use-of-info">
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>Provide and improve Services.</li>
            <li>Process payments and transactions.</li>
            <li>Facilitate bookings and operations.</li>
            <li>Communicate (support, notices, updates).</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </section>

        <section id="international">
          <h2>3. International Data Transfers</h2>
          <p>
            Your data may be stored or processed outside your country, including
            jurisdictions without equivalent protections. We apply safeguards in
            line with applicable laws (including POPIA).
          </p>
        </section>

        <section id="third-parties">
          <h2>4. Third-Party Services</h2>
          <p>
            We may share data with trusted processors (payments, hosting,
            analytics). They act on our behalf under confidentiality and data
            protection obligations.
          </p>
        </section>

        <section id="popia-rights">
          <h2>5. Your Rights Under POPIA</h2>
          <ul>
            <li>Access your personal data.</li>
            <li>Request correction or deletion.</li>
            <li>Object to or restrict processing.</li>
            <li>Complain to the Information Regulator.</li>
          </ul>
          <p>Use the contact details in Section 8 to exercise these rights.</p>
        </section>

        <section id="security">
          <h2>6. Security of Your Information</h2>
          <p>
            We employ reasonable technical and organizational safeguards. No
            system is fully secure; we cannot guarantee absolute protection.
          </p>
        </section>

        <section id="retention">
          <h2>7. Data Retention</h2>
          <p>
            We retain data only as needed to provide Services, meet legal
            duties, and resolve disputes. Data no longer required is deleted or
            anonymized.
          </p>
        </section>

        <section id="contact">
          <h2>8. Contact Us</h2>
          <p>
            FleetExchange
            <br />
            Email: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            <br />
            Phone:{" "}
            <a href={`tel:${SUPPORT_PHONE_TEL}`}>{SUPPORT_PHONE_DISPLAY}</a>
            <br />
            Registered Address: 6 Jacksons Terrace, 81 Buitenkant Street,
            Gardens, Cape Town
          </p>
        </section>

        <section id="changes">
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Policy periodically. Significant changes will be
            communicated via email or in-app notice. Continued use after updates
            constitutes acceptance.
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
