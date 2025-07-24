"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import PayoutAccountForm from "./PayoutAccountForm";

const BAManagementPage = () => {
  const [banks, setBanks] = useState<{ code: string; name: string }[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get current user
  const { user } = useUser();
  const userId = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  )?._id;

  // Fetch user's payout account
  const payoutAccount = useQuery(
    api.payoutAccount.getByUser,
    userId ? { userId } : "skip"
  );

  // Mutation to delete payout account
  const deletePayoutAccount = useMutation(api.payoutAccount.deleteByUser);

  // Fetch banks
  useEffect(() => {
    async function fetchBanks() {
      setLoadingBanks(true);
      const res = await fetch("/api/paystack-banks");
      const data = await res.json();
      const uniqueBanks = Array.from(
        new Map(data.map((bank: any) => [bank.code, bank])).values()
      ) as { code: string; name: string }[];
      setBanks(uniqueBanks);
      setLoadingBanks(false);
    }
    fetchBanks();
  }, []);

  // Handler for adding payout account
  const handleSave = async (data: any) => {
    // You may want to add a mutation here to create the payout account
    // This is just a placeholder for your logic
    console.log("Payout account saved:", data);
  };

  // Handler for deleting payout account
  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    if (userId) {
      await deletePayoutAccount({ userId });
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Bank Account Management</h2>
      {payoutAccount ? (
        <div className="bg-base-100 rounded-2xl shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-2">Your Bank Account</h3>
          <div className="mb-2">
            <span className="font-medium">Account Name:</span>{" "}
            {payoutAccount.accountName}
          </div>
          <div className="mb-2">
            <span className="font-medium">Account Number:</span>{" "}
            {payoutAccount.accountNumber}
          </div>
          <div className="mb-2">
            <span className="font-medium">Bank:</span>{" "}
            {banks.find((b) => b.code === payoutAccount.bankCode)?.name ||
              payoutAccount.bankCode}
          </div>
          <div className="mb-2">
            <span className="font-medium">Email:</span>{" "}
            {payoutAccount.email || "-"}
          </div>
          <div className="mb-2">
            <span className="font-medium">Phone:</span>{" "}
            {payoutAccount.phone || "-"}
          </div>
          <button className="btn btn-error mt-4" onClick={handleDelete}>
            {showDeleteConfirm ? "Confirm Delete" : "Delete Bank Account"}
          </button>
          {showDeleteConfirm && (
            <div className="text-sm text-red-600 mt-2">
              Are you sure you want to delete your bank account? This action
              cannot be undone.
            </div>
          )}
        </div>
      ) : (
        <PayoutAccountForm
          banks={banks}
          loading={loadingBanks}
          onSave={handleSave}
        />
      )}
      {!payoutAccount && (
        <div className="text-xs text-base-content/60 mt-2 text-center">
          Your bank details are encrypted and securely stored.
        </div>
      )}
    </div>
  );
};

export default BAManagementPage;
