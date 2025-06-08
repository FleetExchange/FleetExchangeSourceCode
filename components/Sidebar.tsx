import React from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  CiHome,
  CiCompass1,
  CiDeliveryTruck,
  CiBookmark,
  CiShoppingCart,
  CiSettings,
  CiUser,
} from "react-icons/ci";
import { CiMenuBurger } from "react-icons/ci";
import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="drawer z-50">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content fixed left-5 top-5">
        {/* Page content here */}
        <label htmlFor="my-drawer" className="btn btn-ghost drawer-button">
          <CiMenuBurger className="w-6 h-6" />
        </label>
      </div>

      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <div className="menu bg-base-200 w-80 min-h-full p-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 px-2 mb-6">
            <h1 className="text-xl font-bold">FreightConnect</h1>
          </div>

          {/* Main Navigation - Flex Grow to Push Sign In to Bottom */}
          <div className="flex-grow">
            {/* Navigation Links */}
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-3 p-3 hover:bg-base-300 rounded-lg"
                >
                  <CiHome className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/discover"
                  className="flex items-center gap-3 p-3 hover:bg-base-300 rounded-lg"
                >
                  <CiCompass1 className="w-5 h-5" />
                  <span>Discover</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/fleetManager"
                  className="flex items-center gap-3 p-3 hover:bg-base-300 rounded-lg"
                >
                  <CiDeliveryTruck className="w-5 h-5" />
                  <span>Fleet Manager</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/myTrips"
                  className="flex items-center gap-3 p-3 hover:bg-base-300 rounded-lg"
                >
                  <CiBookmark className="w-5 h-5" />
                  <span>My Trips</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/myBookings"
                  className="flex items-center gap-3 p-3 hover:bg-base-300 rounded-lg"
                >
                  <CiShoppingCart className="w-5 h-5" />
                  <span>My Bookings</span>
                </Link>
              </li>
            </ul>

            {/* Divider */}
            <div className="divider my-4"></div>

            {/* Settings Section */}
            <ul className="space-y-2">
              <li>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 p-3 hover:bg-base-300 rounded-lg"
                >
                  <CiSettings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="flex items-center gap-3 p-3 hover:bg-base-300 rounded-lg"
                >
                  <CiUser className="w-5 h-5" />
                  <span>Account</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* User Section - Always at Bottom */}
          <div className="mt-auto pt-4 border-t border-base-300">
            <SignedIn>
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <UserButton afterSignOutUrl="/" />
                <span className="text-sm font-medium">Profile</span>
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn btn-primary w-full gap-2">
                  <CiUser className="w-5 h-5" />
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
