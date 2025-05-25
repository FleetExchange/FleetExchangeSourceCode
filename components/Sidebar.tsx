import React from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { CiMenuBurger } from "react-icons/ci";
import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="drawer">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content absolute left-5 top-5">
        {/* Page content here */}
        <label htmlFor="my-drawer">
          <CiMenuBurger />
        </label>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4 text-lg font-semibold">
          {/* Sidebar content here */}
          <h1>Menu</h1>
          <li>
            <Link href="/" className="text-primary">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/discover" className="text-primary">
              Discover
            </Link>
          </li>
          <li>
            <Link href="/fleetManager" className="text-primary">
              Fleet Manager
            </Link>
          </li>
          <li>
            <a className="text-primary">Trip Manager</a>
          </li>
          <li>
            <a className="text-primary">My Trips</a>
          </li>
          <li>
            <Link href="/myBookings" className="text-primary">
              My Bookings
            </Link>
          </li>
          <li>
            <a className="text-primary">Create</a>
          </li>
          <hr />
          <li>
            <a className="text-primary">Settings</a>
          </li>
          <li>
            <a className="text-primary">Account</a>
          </li>

          <div className="fixed bottom-1">
            <SignedIn>
              <UserButton />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn btn-primary">Sign In</button>
              </SignInButton>
            </SignedOut>
          </div>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
