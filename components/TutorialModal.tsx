"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type TutorialModalProps = {
  open: boolean;
  onClose: () => void;
};

const DISMISS_KEY = "fx_tutorial_dismissed";

// Map step number (1-based) to image in /public/tutorial/client
const IMAGE_MAP: Record<
  number,
  { src: string; alt: string; width?: number; height?: number }
> = {
  1: {
    src: "/tutorial/client/dashboard.png",
    alt: "Dashboard overview",
    width: 1280,
    height: 720,
  },
  2: {
    src: "/tutorial/client/profile.png",
    alt: "Profile Information",
    width: 1280,
    height: 720,
  },

  3: {
    src: "/tutorial/client/discover.png",
    alt: "Discover screen",
    width: 1280,
    height: 720,
  },
  4: {
    src: "/tutorial/client/book.png",
    alt: "Book screen",
    width: 1280,
    height: 720,
  },
  5: {
    src: "/tutorial/client/pay.png",
    alt: "Payment screen",
    width: 1280,
    height: 720,
  },
  6: {
    src: "/tutorial/client/mybooking.png",
    alt: "My bookings screen",
    width: 1280,
    height: 720,
  },
  7: {
    src: "/tutorial/client/delivered.png",
    alt: "Delivered screen",
    width: 1280,
    height: 720,
  },
};

export default function TutorialModal({ open, onClose }: TutorialModalProps) {
  const steps = useMemo(
    () => [
      {
        title: "Get to know the Dashboard",
        body: (
          <>
            <div className="space-y-2">
              <p>
                The dashboard gives you a quick overview and shortcuts to common
                actions.
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  Sidebar: navigate between Discover, My Bookings, Calendar, and
                  Settings.
                </li>
                <li>
                  Quick actions: book a trip, find routes, or get support.
                </li>
                <li>Notifications: see important updates in the top right.</li>
                <li>Widgets: track recent activity at a glance.</li>
              </ul>
            </div>
          </>
        ),
      },
      {
        title: "Set up your Profile",
        body: (
          <>
            <div className="space-y-2">
              <p>
                Complete your profile to ensure accurate information and
                increase credibility.
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Company details: name, logo, address & about.</li>
                <li>Contact detials: email & phone number.</li>
                <li>Documentation: required documents must be kept current.</li>
              </ul>
            </div>
          </>
        ),
      },
      {
        title: "Discover Routes",
        body: (
          <>
            <div className="space-y-2">
              <p>Search the marketplace to find suitable routes.</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Use the search and filters to narrow results.</li>
                <li>
                  Open a trip to see price, availability, and transporter
                  rating.
                </li>
                <li>
                  Routes are city-to-city; exact addresses are set when you
                  book.
                </li>
              </ul>
            </div>
          </>
        ),
      },
      {
        title: "Book a Trip",
        body: (
          <>
            <div className="space-y-2">
              <p>
                Provide the required shipment details to help the transporter
                accept your booking.
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  Be exact when setting the pickup and delivery addresses so
                  drivers can locate the correct locations.
                </li>
                <li>
                  Provide detailed handover instructions to reduce uncertainty
                  and the chance of issues during the trip. Phone numbers are
                  highly recommended.
                </li>
                <li>
                  Detailed cargo info increases the chance of your booking being
                  accepted, as it reduces uncertainty regarding vehicle
                  compatibility.
                </li>
                <li>
                  Submit the request; the transporter will accept or decline.
                </li>
              </ul>
            </div>
          </>
        ),
      },
      {
        title: "Pay Securely",
        body: (
          <>
            <div className="space-y-2">
              <p>
                When your booking is accepted, you will be notified and can
                complete payment safely.
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  You have 24 hours from acceptance to complete payment;
                  otherwise, the booking is forfeited.
                </li>
                <li>
                  Payments are processed securely; multiple payment methods are
                  supported.
                </li>
                <li>
                  Funds are held in escrow and released after delivery is
                  confirmed with a Proof of Delivery (POD).
                </li>
              </ul>
            </div>
          </>
        ),
      },
      {
        title: "Manage Bookings",
        body: (
          <>
            <div className="space-y-2">
              <p>Track every trip from the My Bookings page.</p>
              <p>Understanding booking status:</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>
                  Awaiting Confirmation — booking sent, waiting for transporter
                  response.
                </li>
                <li>Booked — confirmed and scheduled.</li>
                <li>Dispatched — in transit.</li>
                <li>Delivered — reached the destination.</li>
                <li>Cancelled — cancelled by you or the transporter.</li>
                <li>Refunded — payment returned after cancellation.</li>
              </ol>
              <p>
                Filter, search, and open a booking to view price breakdowns,
                PODs, and transporter details.
              </p>
            </div>
          </>
        ),
      },
      {
        title: "Confirm Delivery",
        body: (
          <>
            <div className="space-y-2">
              <p>
                After delivery, transporters upload a Proof of Delivery to
                confirm a successful trip.
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  View or download the Proof of Delivery (POD) on the booking
                  page.
                </li>
                <li>
                  The transporter receives payment only after the booking is
                  confirmed as delivered.
                </li>
                <li>
                  Rate the transporter and leave feedback to help maintain
                  high‑quality transporters on the FleetExchange platform.
                </li>
              </ul>
            </div>
          </>
        ),
      },
    ],
    []
  );

  const [idx, setIdx] = useState(0);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    if (!open) {
      setIdx(0);
      setDontShow(false);
    }
  }, [open]);

  const isFirst = idx === 0;
  const isLast = idx === steps.length - 1;

  const handleClose = () => {
    if (dontShow) localStorage.setItem(DISMISS_KEY, "true");
    onClose();
  };

  if (!open) return null;

  return (
    <dialog open className="modal modal-open">
      {/* Wider modal */}
      <div className="modal-box w-[96vw] max-w-5xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl md:text-2xl">Client Tutorial</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Bigger stepper */}
        <ul
          className="steps steps-horizontal justify-center mb-6"
          style={
            {
              // DaisyUI steps sizing
              ["--size" as any]: "2.25rem",
              ["--step-spacing" as any]: "1rem",
            } as React.CSSProperties
          }
        >
          {steps.map((s, i) => (
            <li
              key={s.title}
              className={`step ${i <= idx ? "step-primary" : ""}`}
              aria-current={i === idx ? "step" : undefined}
              data-content={String(i + 1)}
            />
          ))}
        </ul>

        {/* Scrollable content area with bigger image */}
        <div className="space-y-4 max-h-[70vh] overflow-auto pr-1">
          <h4 className="text-lg font-semibold">{steps[idx].title}</h4>
          <div className="text-sm md:text-base text-base-content/70 space-y-2">
            {steps[idx].body}
          </div>

          {(() => {
            const stepNumber = idx + 1;
            const img = IMAGE_MAP[stepNumber];
            if (!img) return null;
            return (
              <a
                href={img.src}
                target="_blank"
                rel="noreferrer"
                className="block"
                title="Open full size"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={img.width ?? 1600}
                  height={img.height ?? 900}
                  className="w-full h-auto rounded-xl border border-base-300"
                  sizes="(max-width: 1280px) 90vw, 1100px"
                  priority={stepNumber === 1}
                />
              </a>
            );
          })()}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <label className="label cursor-pointer gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
            />
            <span className="label-text text-sm">Don’t show this again</span>
          </label>

          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={handleClose}>
              Skip
            </button>
            <button
              className="btn"
              onClick={() => setIdx((v) => Math.max(0, v - 1))}
              disabled={isFirst}
            >
              Back
            </button>
            <button
              className="btn btn-primary"
              onClick={() =>
                isLast
                  ? handleClose()
                  : setIdx((v) => Math.min(steps.length - 1, v + 1))
              }
            >
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={handleClose}>
        <button aria-label="Close backdrop">close</button>
      </form>
    </dialog>
  );
}
