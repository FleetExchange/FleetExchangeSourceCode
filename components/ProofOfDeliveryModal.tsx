"use client";

import React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

type Props = {
  purchaseTripId: Id<"purchaseTrip">;
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void; // continue “set delivered” logic
};

export default function ProofOfDeliveryModal({
  purchaseTripId,
  open,
  onClose,
  onSuccess,
}: Props) {
  const genUrl = useMutation(api.proofOfDelivery.generateUploadUrl);
  const createPOD = useMutation(api.proofOfDelivery.create);
  const replacePOD = useMutation(api.proofOfDelivery.replace);

  // Get the logged in user identity
  const { user } = useUser();

  // Get user's Convex ID
  const userId = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "skip",
  })?._id;

  const [file, setFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const isPdf = file?.type === "application/pdf";
  const tooBig = (file?.size ?? 0) > 15 * 1024 * 1024; // 15MB

  const handleSubmit = async () => {
    if (!file || !isPdf || tooBig || userId) return;
    setBusy(true);
    try {
      const uploadUrl = await genUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();

      try {
        await createPOD({
          purchaseTripId,
          fileId: storageId,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          userId: userId,
        });
      } catch (e) {
        // If already exists, replace
        await replacePOD({
          purchaseTripId,
          fileId: storageId,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          userId: userId,
        });
      }

      await Promise.resolve(onSuccess());
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to attach Proof of Delivery. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`modal ${open ? "modal-open" : ""}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-box">
        <h3 className="font-semibold">Upload Proof of Delivery (PDF)</h3>
        <p className="text-sm text-base-content/60 mb-3">
          Please attach a PDF before marking this trip as Delivered.
        </p>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={busy}
          className="file-input file-input-bordered w-full"
        />
        {file && !isPdf && (
          <p className="mt-2 text-xs text-error">Only PDF files are allowed.</p>
        )}
        {file && tooBig && (
          <p className="mt-2 text-xs text-error">Max size is 15MB.</p>
        )}

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!file || !isPdf || tooBig || busy}
          >
            {busy ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              "Submit & Continue"
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
