import React from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import {
  CiHome,
  CiCompass1,
  CiShoppingCart,
  CiSettings,
  CiUser,
} from "react-icons/ci";
import Link from "next/link";

const ClientSidebar = () => {
  return (
    <div className="group fixed left-0 top-0 z-50 min-h-screen w-20 hover:w-50 bg-primary transition-all duration-300 ease-in-out overflow-hidden shadow-lg">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-center group-hover:justify-start gap-3 mb-6 p-3 transition-all duration-300">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-content font-bold">
            F
          </div>
          <span className="hidden group-hover:block transition-opacity duration-300 whitespace-nowrap text-primary-content font-semibold">
            FreightConnect
          </span>
        </div>

        {/* Main Navigation */}
        <div className="flex-grow px-2">
          <ul className="space-y-2">
            <li>
              <Link
                href="/client/dashboard"
                className="flex items-center justify-center group-hover:justify-start gap-3 p-3 hover:bg-secondary rounded-lg transition-all duration-300"
              >
                <CiHome className="w-6 h-6 text-primary-content flex-shrink-0" />
                <span className="hidden group-hover:block whitespace-nowrap text-primary-content">
                  Dashboard
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/discover"
                className="flex items-center justify-center group-hover:justify-start gap-3 p-3 hover:bg-secondary rounded-lg transition-all duration-300"
              >
                <CiCompass1 className="w-6 h-6 text-primary-content flex-shrink-0" />
                <span className="hidden group-hover:block whitespace-nowrap text-primary-content">
                  Discover
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/myBookings"
                className="flex items-center justify-center group-hover:justify-start gap-3 p-3 hover:bg-secondary rounded-lg transition-all duration-300"
              >
                <CiShoppingCart className="w-6 h-6 text-primary-content flex-shrink-0" />
                <span className="hidden group-hover:block whitespace-nowrap text-primary-content">
                  My Bookings
                </span>
              </Link>
            </li>
          </ul>

          <div className="my-4 border-t border-primary-content border-opacity-20"></div>

          <ul className="space-y-2">
            <li>
              <Link
                href="/settings"
                className="flex items-center justify-center group-hover:justify-start gap-3 p-3 hover:bg-secondary rounded-lg transition-all duration-300"
              >
                <CiSettings className="w-6 h-6 text-primary-content flex-shrink-0" />
                <span className="hidden group-hover:block whitespace-nowrap text-primary-content">
                  Settings
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/account"
                className="flex items-center justify-center group-hover:justify-start gap-3 p-3 hover:bg-secondary rounded-lg transition-all duration-300"
              >
                <CiUser className="w-6 h-6 text-primary-content flex-shrink-0" />
                <span className="hidden group-hover:block whitespace-nowrap text-primary-content">
                  Account
                </span>
              </Link>
            </li>
          </ul>
          <div className="my-4 border-t border-primary-content border-opacity-20"></div>
        </div>

        {/* User Section */}
        <div className="mt-auto p-3">
          <SignedIn>
            <div className="flex items-center justify-center group-hover:justify-start gap-3 p-2 rounded-lg transition-all duration-300">
              <div className="w-6 h-6 flex items-center justify-center">
                <UserButton afterSignOutUrl="/sign-in" />
              </div>
              <span className="hidden group-hover:block whitespace-nowrap text-sm font-medium text-primary-content">
                Profile
              </span>
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
};

export default ClientSidebar;
