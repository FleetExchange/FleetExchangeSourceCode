"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
} from "@/shared/support";

const sections = [
  { id: "what-are-cookies", title: "1. What Are Cookies?" },
  { id: "types", title: "2. Types of Cookies We Use" },
  { id: "third-party", title: "3. Third-Party Cookies" },
  { id: "choices", title: "4. Your Cookie Choices" },
  { id: "updates", title: "5. Updates to This Policy" },
  { id: "contact", title: "6. Contact Us" },
];

export default function CookiePolicyPage() {
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
        Cookie Policy
      </h1>

      <p className="mt-4 text-sm leading-relaxed text-base-content/70">
        FleetExchange (“we,” “our,” or “us”) uses cookies and similar
        technologies to improve your experience on our website and app. This
        Cookie Policy explains what cookies are, how we use them, and your
        choices.
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
        <section id="what-are-cookies">
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files placed on your device when you visit a
            website. They help remember preferences, enhance performance, and
            provide personalized experiences.
          </p>
        </section>

        <section id="types">
          <h2>2. Types of Cookies We Use</h2>
          <p>
            <strong>Strictly Necessary Cookies</strong>
            <br />
            Essential for core functionality (secure login, transaction
            processing).
          </p>
          <p>
            <strong>Performance & Analytics Cookies</strong>
            <br />
            Help us understand usage patterns to improve functionality.
          </p>
          <p>
            <strong>Functionality Cookies</strong>
            <br />
            Remember preferences (fleets, routes, language).
          </p>
          <p>
            <strong>Advertising & Marketing Cookies</strong>
            <br />
            Used to deliver relevant offers or promotions on or off the
            platform.
          </p>
        </section>

        <section id="third-party">
          <h2>3. Third-Party Cookies</h2>
          <p>
            Trusted third parties (payments, authentication, analytics) may set
            cookies. Their cookies are governed by their own policies.
          </p>
        </section>

        <section id="choices">
          <h2>4. Your Cookie Choices</h2>
          <ul>
            <li>Manage or disable cookies in your browser settings.</li>
            <li>Disabling some cookies may affect functionality.</li>
            <li>Opt-out of interest-based ads at www.youronlinechoices.com.</li>
          </ul>
        </section>

        <section id="updates">
          <h2>5. Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy periodically. The latest version
            will always appear here. Significant changes may be notified via app
            or email.
          </p>
        </section>

        <section id="contact">
          <h2>6. Contact Us</h2>
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
