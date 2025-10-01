"use client";

import React, { useState } from "react";
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

export default function CookiePolicyPage() {
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
        Cookie Policy
      </h1>

      <p className="mt-4 text-sm leading-relaxed text-base-content/70 max-w-3xl">
        FleetExchange (“we,” “our,” or “us”) uses cookies and similar
        technologies to enhance your experience. This Policy explains what
        cookies are, how we use them, and the choices available to you.
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
        <SectionWrapper id="what-are-cookies">
          <H2>1. What Are Cookies?</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            Cookies are small text files stored on your device when you visit a
            site. They enable preference remembering, performance enhancements,
            and personalized features.
          </p>
        </SectionWrapper>

        <SectionWrapper id="types">
          <H2>2. Types of Cookies We Use</H2>
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-base-content mb-1">
                Strictly Necessary Cookies
              </p>
              <p className="text-sm leading-relaxed text-base-content/80">
                Required for core functionality (secure authentication,
                transaction flow).
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-base-content mb-1">
                Performance & Analytics Cookies
              </p>
              <p className="text-sm leading-relaxed text-base-content/80">
                Help us understand usage patterns to improve reliability and UX.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-base-content mb-1">
                Functionality Cookies
              </p>
              <p className="text-sm leading-relaxed text-base-content/80">
                Store preferences (saved fleets, routes, language) for a
                smoother experience.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-base-content mb-1">
                Advertising & Marketing Cookies
              </p>
              <p className="text-sm leading-relaxed text-base-content/80">
                Used to show relevant promotions on or off the platform.
              </p>
            </div>
          </div>
        </SectionWrapper>

        <SectionWrapper id="third-party">
          <H2>3. Third-Party Cookies</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            Trusted third parties (payments, authentication, analytics) may set
            cookies governed by their own policies. We only work with providers
            under contractual and confidentiality controls.
          </p>
        </SectionWrapper>

        <SectionWrapper id="choices">
          <H2>4. Your Cookie Choices</H2>
          <p className="text-sm leading-relaxed text-base-content/80 mb-3">
            You can manage cookies in your browser settings. Note:
          </p>
          <ul className="space-y-2">
            <Bullet>Disabling some cookies may degrade functionality.</Bullet>
            <Bullet>
              You may opt out of interest-based advertising at{" "}
              <span className="underline">www.youronlinechoices.com</span>.
            </Bullet>
            <Bullet>Previously stored cookies can be cleared manually.</Bullet>
          </ul>
        </SectionWrapper>

        <SectionWrapper id="updates">
          <H2>5. Updates to This Policy</H2>
          <p className="text-sm leading-relaxed text-base-content/80">
            We may update this Policy. The latest version is published here;
            material changes may be notified via email or in‑app notices.
          </p>
        </SectionWrapper>

        <SectionWrapper id="contact">
          <H2>6. Contact Us</H2>
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
