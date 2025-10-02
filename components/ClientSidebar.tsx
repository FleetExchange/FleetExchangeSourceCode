"use client";
import React from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import {
  CiHome,
  CiCompass1,
  CiShoppingCart,
  CiSettings,
  CiUser,
  CiCalendar,
} from "react-icons/ci";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const ClientSidebar = () => {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: "/client/dashboard",
      icon: CiHome,
      label: "Dashboard",
    },
    {
      href: "/discover",
      icon: CiCompass1,
      label: "Discover",
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
  ];

  const secondaryItems = [
    {
      href: "/client/settings",
      icon: CiSettings,
      label: "Settings",
    },
    {
      href: "/profiles",
      icon: CiUser,
      label: "Account",
    },
  ];

  return (
    <div className="group fixed left-0 top-0 z-50 min-h-screen w-20 hover:w-64 bg-primary transition-all duration-300 ease-in-out overflow-hidden shadow-lg">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-center group-hover:justify-start gap-3 p-6 border-b border-primary-content/20 transition-all duration-300">
          <div className="w-10 h-10 bg-base-300 rounded-lg flex items-center justify-center text-primary-content font-bold text-lg flex-shrink-0">
            <Logo variant="icon" size="md" href="/client/dashboard" />
          </div>
          <div className="hidden group-hover:block transition-opacity duration-300">
            <h2 className="text-primary-content font-bold text-lg whitespace-nowrap">
              FleetExchange
            </h2>
            <p className="text-primary-content/70 text-sm whitespace-nowrap">
              Client Portal
            </p>
          </div>
        </div>

        {/* Main Navigation */}
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
                      className={`flex items-center justify-center group-hover:justify-start gap-4 p-4 rounded-lg transition-all duration-300 ${
                        isActive
                          ? "bg-primary-content/20 text-primary-content border-l-4 border-primary-content"
                          : "text-primary-content/80 hover:bg-primary-content/10 hover:text-primary-content"
                      }`}
                    >
                      <Icon className="w-6 h-6 flex-shrink-0" />
                      <span className="hidden group-hover:block whitespace-nowrap font-medium">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Divider */}
            <div className="my-6 border-t border-primary-content/20"></div>

            {/* Secondary Navigation */}
            <ul className="space-y-2">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-center group-hover:justify-start gap-4 p-4 rounded-lg transition-all duration-300 ${
                        isActive
                          ? "bg-primary-content/20 text-primary-content border-l-4 border-primary-content"
                          : "text-primary-content/80 hover:bg-primary-content/10 hover:text-primary-content"
                      }`}
                    >
                      <Icon className="w-6 h-6 flex-shrink-0" />
                      <span className="hidden group-hover:block whitespace-nowrap font-medium">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-primary-content/20">
          <div className="flex items-center justify-center group-hover:justify-start gap-3 p-3 rounded-lg bg-primary-content/10 transition-all duration-300">
            <SignedIn>
              <UserButton
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                    userButtonPopoverCard: "bg-base-100",
                    userButtonPopoverActionButton: "hover:bg-base-200",
                  },
                }}
              />
            </SignedIn>
            <div className="hidden group-hover:block flex-grow">
              <p className="text-primary-content font-medium text-sm whitespace-nowrap">
                Account Settings
              </p>
              <p className="text-primary-content/70 text-xs whitespace-nowrap">
                Manage your profile
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSidebar;
