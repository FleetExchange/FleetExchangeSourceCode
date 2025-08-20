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
} from "lucide-react";

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
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg font-bold text-base-content">
                  FreightConnect
                </span>
              </div>
              <p className="text-sm text-base-content/60 leading-relaxed">
                Connecting transporters and clients for efficient &
                instantaneous freight logistics solutions.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                <a href="#" className="text-base-content/60 hover:text-primary">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-base-content/60 hover:text-primary">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base-content">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/discover"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    Discover Trips
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
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
                    href="/help"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
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
                    href="mailto:support@freightconnect.com"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    support@freightconnect.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <a
                    href="tel:+27123456789"
                    className="text-sm text-base-content/60 hover:text-primary transition-colors"
                  >
                    +27 12 345 6789
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

            {/* Newsletter Signup */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base-content">Newsletter</h3>
              <div className="flex gap-2">
                <input type="email" className="input input-sm flex-1" />
                <button className="btn btn-primary btn-sm">Subscribe</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-base-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-base-content/60">
              © {currentYear} FreightConnect. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-sm text-base-content/60 hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/cookies"
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
