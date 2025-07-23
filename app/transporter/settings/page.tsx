"use client";

import React, { useEffect, useState } from "react";
import PayoutAccountForm from "@/components/PayoutAccountForm";

const TransporterSettings = () => {
  const [banks, setBanks] = useState<{ code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBanks() {
      setLoading(true);
      const res = await fetch("/api/paystack-banks");
      const data = await res.json();
      setBanks(data);
      setLoading(false);
    }
    fetchBanks();
  }, []);

  const uniqueBanks = Array.from(
    new Map(banks.map((bank) => [bank.code, bank])).values()
  );

  return (
    <div>
      <PayoutAccountForm
        banks={uniqueBanks}
        loading={loading}
        onSave={(data) => {
          // Optionally handle post-save actions
          console.log("Payout account saved:", data);
        }}
      />
    </div>
  );
};

export default TransporterSettings;
