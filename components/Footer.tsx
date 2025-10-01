"use client";

import React from "react";
import Link from "next/link";
import {
  Truck,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import Logo from "./Logo";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
} from "@/shared/support";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-300 border-t border-base-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="py-8 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <Logo variant="icon" size="md" />
                </div>
                <span className="text-lg font-bold text-base-content">
                  FleetExchange
                </span>
              </div>
              <p className="text-sm text-base-content/60 leading-relaxed">
                Connecting transporters and clients for easy, instantaneous and
                reliable logistic solutions.
              </p>
              {/* Social Links */}
              <div className="flex gap-4">
                {/* Social Media Icons */}
                <div className="w-8 h-8 bg-base-content/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
                  <span className="text-xs">f</span>
                </div>
                <div className="w-8 h-8 bg-base-content/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
                  <span className="text-xs">t</span>
                </div>
                <div className="w-8 h-8 bg-base-content/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
                  <span className="text-xs">in</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base-content">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/sign-up"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base-content">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/TermsOfService"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base-content">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <a
                    href={`tel:${SUPPORT_PHONE_TEL}`}
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    {SUPPORT_PHONE_DISPLAY}
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <span className="text-sm text-base-content/60">
                    Cape Town, South Africa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-base-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-base-content/60">
              © {currentYear} FleetExchange. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link
                href="/PrivacyPolicy"
                className="text-sm text-base-content/60 hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/CookiePolicy"
                className="text-sm text-base-content/60 hover:text-primary transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
