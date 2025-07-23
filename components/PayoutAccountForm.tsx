"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";

interface PayoutAccountFormProps {
  onSave: (data: {
    accountName: string;
    accountNumber: string;
    bankCode: string;
    email?: string;
    phone?: string;
  }) => void;
  loading?: boolean;
  error?: string;
  initial?: Partial<{
    accountName: string;
    accountNumber: string;
    bankCode: string;
    email: string;
    phone: string;
  }>;
  banks: { code: string; name: string }[];
}

const PayoutAccountForm: React.FC<PayoutAccountFormProps> = ({
  onSave,
  loading,
  error,
  initial = {},
  banks,
}) => {
  const [accountName, setAccountName] = useState(initial.accountName || "");
  const [accountNumber, setAccountNumber] = useState(
    initial.accountNumber || ""
  );
  const [bankCode, setBankCode] = useState(initial.bankCode || "");
  const [email, setEmail] = useState(initial.email || "");
  const [phone, setPhone] = useState(initial.phone || "");

  const { user } = useUser();
  const userId = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id as Id<"users"> } : "skip"
  )?._id;

  const createPayoutAccount = useMutation(
    api.payoutAccount.createPayoutAccount
  );

  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError(undefined);
    try {
      await createPayoutAccount({
        userId: userId as Id<"users">,
        accountName,
        accountNumber,
        bankCode,
        email,
        phone,
      });
      if (onSave)
        onSave({ accountName, accountNumber, bankCode, email, phone });
    } catch (err: any) {
      setLocalError(err.message || "Failed to save payout account.");
    }
    setLocalLoading(false);
  };

  return (
    <form
      className="bg-base-100 rounded-2xl shadow-xl p-8 max-w-md mx-auto flex flex-col gap-4"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-bold mb-2">Add Payout Account</h2>
      <p className="text-base-content/70 text-sm mb-4">
        Your bank details are encrypted and securely stored. We only use this
        information to send you payouts.{" "}
        <span className="font-semibold">We never share your data.</span>
      </p>
      <div>
        <label className="block font-medium mb-1">Account Holder Name</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Account Number</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required
          pattern="\d{10,}"
          maxLength={12}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Bank</label>
        <select
          className="select select-bordered w-full"
          value={bankCode}
          onChange={(e) => setBankCode(e.target.value)}
          required
        >
          <option value="">Select your bank</option>
          {banks.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Email (optional)</label>
        <input
          type="email"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Phone (optional)</label>
        <input
          type="tel"
          className="input input-bordered w-full"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      {(error || localError) && (
        <div className="text-red-600 text-sm">{error || localError}</div>
      )}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading || localLoading}
      >
        {loading || localLoading ? "Saving..." : "Save Payout Account"}
      </button>
      <div className="text-xs text-base-content/60 mt-2 text-center">
        Your details are protected by bank-grade encryption.
      </div>
    </form>
  );
};

export default PayoutAccountForm;
