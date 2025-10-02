// components/MobileMenuClient.tsx
"use client";
import React, { useState, useEffect } from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import {
  CiHome,
  CiCompass1,
  CiShoppingCart,
  CiSettings,
  CiUser,
  CiCalendar,
  CiMenuBurger,
} from "react-icons/ci";
import { VscClose } from "react-icons/vsc";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const MobileMenuClient = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navigationItems = [
    {
      href: "/client/dashboard",
      icon: CiHome,
      label: "Dashboard",
    },
    {
      href: "/discover",
      icon: CiCompass1,
      label: "Discover Trips",
    },
    {
      href: "/myBookings",
      icon: CiShoppingCart,
      label: "My Bookings",
    },
    {
      href: "/client/calendar",
      icon: CiCalendar,
      label: "Calendar",
    },
    {
      href: "/profiles/me",
      icon: CiUser,
      label: "Profile",
    },
    {
      href: "/client/settings",
      icon: CiSettings,
      label: "Settings",
    },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary hover:bg-primary/90 text-primary-content p-3 rounded-lg shadow-lg transition-all duration-300"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <VscClose className="w-6 h-6" />
        ) : (
          <CiMenuBurger className="w-6 h-6" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-primary transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary-content/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-base-300 rounded-lg flex items-center justify-center text-primary-content font-bold text-lg">
                <Logo variant="icon" size="md" href="/client/dashboard" />
              </div>
              <div>
                <h2 className="text-primary-content font-bold text-lg">
                  FleetExchange
                </h2>
                <p className="text-primary-content/70 text-sm">Client Portal</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-primary-content/10 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <VscClose className="w-6 h-6 text-primary-content" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-grow px-4 py-6">
            <nav>
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-primary-content/20 text-primary-content border-l-4 border-primary-content"
                            : "text-primary-content/80 hover:bg-primary-content/10 hover:text-primary-content"
                        }`}
                      >
                        <Icon className="w-6 h-6 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-primary-content/20">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-content/10">
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                      userButtonPopoverCard: "bg-base-100",
                      userButtonPopoverActionButton: "hover:bg-base-200",
                    },
                  }}
                />
              </SignedIn>
              <div className="flex-grow">
                <p className="text-primary-content font-medium text-sm">
                  Account Settings
                </p>
                <p className="text-primary-content/70 text-xs">
                  Manage your profile
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenuClient;
