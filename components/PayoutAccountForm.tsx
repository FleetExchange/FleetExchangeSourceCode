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
      if (!userId) {
        throw new Error("User not found. Please log in and try again.");
      }

      // 1. Verify account with Paystack
      console.log("Verifying account...", { accountNumber, bankCode });

      const verifyResponse = await fetch("/api/paystack/verify-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber,
          bankCode,
        }),
      });

      const verifyData = await verifyResponse.json();
      console.log("Verify response:", verifyData);

      if (!verifyData.status) {
        throw new Error(verifyData.message || "Account verification failed");
      }

      // Use verified account name from Paystack
      const verifiedAccountName = verifyData.data.account_name;

      // 2. Create recipient in Paystack
      console.log("Creating recipient...", {
        name: verifiedAccountName,
        accountNumber,
        bankCode,
      });

      const recipientResponse = await fetch("/api/paystack/create-recipient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: verifiedAccountName,
          accountNumber,
          bankCode,
          email: email || undefined,
        }),
      });

      const recipientData = await recipientResponse.json();
      console.log("Recipient response:", recipientData);

      if (!recipientData.status) {
        throw new Error(recipientData.message || "Failed to create recipient");
      }

      // Get bank name from banks array
      const selectedBank = banks.find((bank) => bank.code === bankCode);
      const bankName = selectedBank?.name || "Unknown Bank";

      // 3. Save to database
      await createPayoutAccount({
        userId,
        accountName: verifiedAccountName,
        accountNumber,
        bankCode,
        bankName,
        email: email || undefined,
        phone: phone || undefined,
        paystackRecipientCode: recipientData.data.recipient_code,
        recipientId: recipientData.data.id?.toString(),
        isVerified: true,
      });

      onSave({
        accountName: verifiedAccountName,
        accountNumber,
        bankCode,
        email,
        phone,
      });

      alert("Bank account added successfully!");
    } catch (error: any) {
      console.error("Error saving payout account:", error);
      setLocalError(error.message || "Failed to save payout account.");
    }
    setLocalLoading(false);
  };

  const [verifying, setVerifying] = useState(false);
  const verifyAccount = async () => {
    if (!accountNumber || !bankCode) {
      alert("Please enter account number and select bank");
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch("/api/paystack/verify-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber,
          bankCode,
        }),
      });

      const data = await response.json();

      if (data.status) {
        setAccountName(data.data.account_name);
        alert(`Account verified: ${data.data.account_name}`);
      } else {
        alert("Account verification failed. Please check your details.");
      }
    } catch (error) {
      alert("Error verifying account. Please try again.");
    } finally {
      setVerifying(false);
    }
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
        <label className="block font-medium mb-1">Account Number</label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Enter account number"
            required
          />
          <button
            type="button"
            onClick={verifyAccount}
            className="btn btn-outline"
            disabled={verifying}
          >
            {verifying ? "Verifying..." : "Verify"}
          </button>
        </div>
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
        <label className="block font-medium mb-1">Account Holder Name</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Account holder name"
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Email (optional)</label>
        <input
          type="email"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Phone (optional)</label>
        <input
          type="tel"
          className="input input-bordered w-full"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+27 123 456 789"
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
