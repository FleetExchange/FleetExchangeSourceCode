"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FileComponent from "@/components/FileComponent";

interface TransporterProfileFilesProps {
  transporterId: string;
}

const IMPORTANT_FILES = [
  { key: "terms", label: "Terms & Conditions" },
  { key: "insurance", label: "Insurance Certificate" },
  { key: "companyReg", label: "Company Registration" },
  { key: "roadworthy", label: "Roadworthy Certificate" },
  { key: "other", label: "Other Supporting Document" },
];

const TransporterProfileFiles: React.FC<TransporterProfileFilesProps> = ({
  transporterId,
}) => {
  // Get the current user based on Clerk ID
  const { user } = useUser();
  const currentUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  // Only owner can edit
  const isOwner = currentUser?._id === transporterId;

  // Get all files for this transporter
  const files = useQuery(api.files.getUserFiles, {
    userId: transporterId as Id<"users">,
  });

  // Helper to get fileId for a category
  const getFileId = (category: string) =>
    files?.find((f) => f.category === category)?._id;

  return (
    <div className="bg-base-100 rounded-2xl shadow-xl p-8 mb-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Important Business Documents</h2>
      <div className="space-y-6">
        {IMPORTANT_FILES.map((file) => (
          <div key={file.key}>
            <label className="font-semibold">{file.label}</label>
            <FileComponent
              userId={transporterId as Id<"users">}
              category={file.key}
              fileId={getFileId(file.key)}
              editable={isOwner}
            />
          </div>
        ))}
      </div>
      <p className="text-base-content/60 mt-6 text-sm">
        Please upload your most recent and valid documents. These files help
        clients trust your business.
      </p>
    </div>
  );
};

export default TransporterProfileFiles;
