"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle,
  Mail,
  Phone,
  HelpCircle,
} from "lucide-react";

interface HelpPageProps {
  onClose?: () => void;
}

const HelpPage: React.FC<HelpPageProps> = ({ onClose }) => {
  const { user } = useUser();
  const userRecord = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "skip",
  });
  const userId = userRecord?._id;

  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitQuery = useMutation(api.userQueries.addUserQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !userId) return;

    try {
      setIsSubmitting(true);
      await submitQuery({ query: message, userId: userId as Id<"users"> });
      setSubmitted(true);
      setMessage("");
    } catch (error) {
      console.error("Failed to submit query:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-success/10 rounded-full border border-success/20">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-base-content">
              Request Submitted Successfully!
            </h3>
            <p className="text-base-content/70">
              Your query has been received. Our support team will review it and
              get back to you as soon as possible.
            </p>
          </div>

          <div className="bg-info/10 border border-info/20 rounded-xl p-4">
            <p className="text-sm text-base-content/80">
              <strong>What happens next?</strong>
              <br />
              • We'll review your request within 24 hours
              <br />
              • You'll receive updates via email
              <br />• For urgent issues, call our support line
            </p>
          </div>

          {onClose && (
            <button onClick={onClose} className="btn btn-primary w-full gap-2">
              <CheckCircle className="w-4 h-4" />
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-base-content">Help & Support</h2>
        <p className="text-base-content/70 max-w-md mx-auto">
          Having issues with FleetExchange? Describe your problem below and our
          support team will assist you.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="label">
            <span className="label-text font-medium flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              Describe your issue or request
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full min-h-[120px] focus:outline-none focus:border-primary resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Please provide as much detail as possible about your issue or feature request..."
            disabled={isSubmitting}
          />
          <div className="label">
            <span className="label-text-alt text-base-content/60">
              {message.length}/500 characters
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full gap-2"
          disabled={!message.trim() || !userId || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="loading loading-spinner loading-sm"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Request
            </>
          )}
        </button>
      </form>

      {/* Contact Information */}
      <div className="bg-base-200/50 border border-base-300 rounded-xl p-4 space-y-4">
        <h3 className="font-semibold text-base-content flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          Other Ways to Reach Us
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="mailto:support@freightconnect.com"
            className="flex items-center gap-3 p-3 bg-base-100 rounded-lg border border-base-300 hover:border-primary transition-colors group"
          >
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="font-medium text-sm text-base-content">
                Email Support
              </div>
              <div className="text-xs text-base-content/60">
                support@freightconnect.com
              </div>
            </div>
          </a>

          <a
            href="tel:+27000000000"
            className="flex items-center gap-3 p-3 bg-base-100 rounded-lg border border-base-300 hover:border-primary transition-colors group"
          >
            <div className="p-2 bg-success/10 rounded-lg group-hover:bg-success/20 transition-colors">
              <Phone className="w-4 h-4 text-success" />
            </div>
            <div>
              <div className="font-medium text-sm text-base-content">
                Phone Support
              </div>
              <div className="text-xs text-base-content/60">0800 123 456</div>
            </div>
          </a>
        </div>

        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <p className="text-xs text-base-content/70">
            <strong>Note:</strong> FleetExchange is currently in development.
            Some features may not work as expected. Your feedback helps us
            improve the platform.
          </p>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-info/10 border border-info/20 rounded-xl p-4">
        <h4 className="font-semibold text-base-content mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-info" />
          Tips for Better Support
        </h4>
        <ul className="text-sm text-base-content/70 space-y-1">
          <li>• Include steps to reproduce the issue</li>
          <li>• Mention your browser and device type</li>

          <li>• Describe what you expected to happen</li>
        </ul>
      </div>
    </div>
  );
};

export default HelpPage;
