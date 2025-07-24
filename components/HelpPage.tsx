"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";

const HelpPage: React.FC = () => {
  const { user } = useUser();
  const userRecord = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "skip",
  });
  const userId = userRecord?._id;

  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitQuery = useMutation(api.userQueries.addUserQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery({ query: message, userId: userId as Id<"users"> });
    setSubmitted(true);
  };

  return (
    <div className="max-w-lg mx-auto bg-base-100 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4">Help & Support</h2>
      <p className="mb-4 text-base-content/70">
        Need assistance? Submit your request below and our support team will get
        back to you as soon as possible.
      </p>
      {submitted ? (
        <div className="text-green-600 font-semibold text-center">
          Your request has been submitted! We'll contact you soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="font-medium">
            Describe your issue or question:
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Type your message here..."
          />
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={!message.trim()}
          >
            Submit Request
          </button>
        </form>
      )}
      <div className="mt-6 text-sm text-base-content/60 text-center">
        For urgent issues, email{" "}
        <a href="mailto:support@freightconnect.com" className="underline">
          support@freightconnect.com
        </a>
      </div>
    </div>
  );
};

export default HelpPage;
