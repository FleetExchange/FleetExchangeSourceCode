"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FileComponent from "@/components/FileComponent";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Calendar,
  Shield,
} from "lucide-react";
import { formatDateInSAST } from "@/utils/dateUtils";

interface ClientProfileFilesProps {
  clientId: string;
}

const IMPORTANT_FILES = [
  {
    key: "companyReg",
    label: "Company Registration (CIPC)",
    required: true,
    description: "Official business registration certificate",
    clientVisible: true,
  },
  {
    key: "directorId",
    label: "Director ID Document",
    required: true,
    description: "Identity verification for business owner",
    clientVisible: false,
  },
];

const ClientProfileFiles: React.FC<ClientProfileFilesProps> = ({
  clientId,
}) => {
  // Get the current user based on Clerk ID
  const { user } = useUser();
  const currentUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  // Only owner can edit
  const isOwner = currentUser?._id === clientId;

  // Get all files for this client
  const files = useQuery(api.files.getUserFiles, {
    userId: clientId as Id<"users">,
  });

  // Helper to get file info including verification status
  const getFileInfo = (category: string) => {
    const file = files?.find((f) => f.category === category);
    return file
      ? {
          fileId: file._id,
          uploaded: true,
          verificationStatus: file.verificationStatus || "pending",
          verifiedAt: file.verifiedAt,
        }
      : {
          fileId: undefined,
          uploaded: false,
          verificationStatus: "not_uploaded",
          verifiedAt: undefined,
        };
  };

  // Get verification status badge
  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <div className="badge badge-success gap-2">
            <CheckCircle className="w-3 h-3" />
            Verified
          </div>
        );
      case "rejected":
        return (
          <div className="badge badge-error gap-2">
            <XCircle className="w-3 h-3" />
            Rejected
          </div>
        );
      case "needs_resubmission":
        return (
          <div className="badge badge-warning gap-2">
            <AlertCircle className="w-3 h-3" />
            Resubmit Required
          </div>
        );
      case "pending":
        return (
          <div className="badge badge-info gap-2">
            <Clock className="w-3 h-3" />
            Under Review
          </div>
        );
      default:
        return (
          <div className="badge badge-neutral gap-2">
            <FileText className="w-3 h-3" />
            Not Uploaded
          </div>
        );
    }
  };

  // Calculate overall verification status
  const requiredFiles = IMPORTANT_FILES.filter((file) => file.required);
  const verifiedCount = requiredFiles.filter((file) => {
    const fileInfo = getFileInfo(file.key);
    return fileInfo.verificationStatus === "approved";
  }).length;

  return (
    <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 sm:p-8 mb-6">
      {/* Header with overall status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-base-content mb-2">
            Important Business Documents
          </h2>
          <p className="text-base-content/60">
            {isOwner
              ? "Upload and manage your verification documents"
              : "Verified business credentials and documentation"}
          </p>
        </div>

        {/* Overall verification status - ONLY show to owners */}
        {isOwner && (
          <div className="flex flex-col items-end gap-2 ml-4">
            {verifiedCount === requiredFiles.length ? (
              <div className="badge badge-success gap-2 whitespace-nowrap">
                <Shield className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs font-medium">Fully Verified</span>
              </div>
            ) : (
              <div className="badge badge-warning gap-2 whitespace-nowrap">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs font-medium">
                  {verifiedCount}/{requiredFiles.length} Verified
                </span>
              </div>
            )}

            {/* Progress indicator */}
            <div className="text-xs text-base-content/60 text-right">
              {Math.round((verifiedCount / requiredFiles.length) * 100)}%
              Complete
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {IMPORTANT_FILES.map((fileConfig) => {
          const fileInfo = getFileInfo(fileConfig.key);

          // Hide non-client-visible docs for non-owners
          if (!isOwner && !fileConfig.clientVisible) {
            return null;
          }

          // Hide unverified client-visible docs from non-owners (transporters)
          if (
            !isOwner &&
            fileConfig.clientVisible &&
            fileInfo.verificationStatus !== "approved"
          ) {
            return null;
          }

          return (
            <div
              key={fileConfig.key}
              className={`border rounded-xl p-4 transition-all ${
                fileInfo.verificationStatus === "approved"
                  ? "border-success bg-success/5"
                  : fileInfo.verificationStatus === "rejected"
                    ? "border-error bg-error/5"
                    : fileInfo.uploaded
                      ? "border-info bg-info/5"
                      : "border-base-300 bg-base-100"
              }`}
            >
              {/* Document header with verification status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-base-content">
                      {fileConfig.label}
                    </h4>
                    {fileConfig.required && (
                      <span className="text-error text-sm">*</span>
                    )}
                    {/* Show "Verified" badge for transporters viewing verified docs */}
                    {fileConfig.clientVisible &&
                      !isOwner &&
                      fileInfo.verificationStatus === "approved" && (
                        <span className="badge badge-success badge-sm gap-1">
                          <CheckCircle className="w-2 h-2" />
                          Verified
                        </span>
                      )}
                  </div>
                  <p className="text-sm text-base-content/60 mb-2">
                    {fileConfig.description}
                  </p>

                  {/* Verification timestamp - only show to owners */}
                  {isOwner && fileInfo.verifiedAt && (
                    <div className="flex items-center gap-1 text-xs text-success">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Verified: {formatDateInSAST(fileInfo.verifiedAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Verification status badge - ONLY show to owners */}
                {isOwner && (
                  <div className="flex-shrink-0">
                    {getVerificationBadge(fileInfo.verificationStatus)}
                  </div>
                )}
              </div>

              {/* File upload component */}
              <FileComponent
                userId={clientId as Id<"users">}
                category={fileConfig.key}
                fileId={fileInfo.fileId}
                editable={isOwner}
              />
            </div>
          );
        })}
      </div>

      {/* Footer messages */}
      {isOwner ? (
        <div className="mt-8 space-y-4">
          {/* Verification progress for owner */}
          {verifiedCount < requiredFiles.length && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning mb-1">
                    Document Verification Required
                  </h4>
                  <p className="text-sm text-base-content/70">
                    {verifiedCount}/{requiredFiles.length} required documents
                    verified. Complete verification to build trust with
                    transporters and access all platform features.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-base-200/50 border border-base-300 rounded-lg p-4">
            <p className="text-base-content/60 text-sm">
              <strong>Important:</strong> It is your responsibility as a client
              to upload your most recent and valid documents. FreightConnect
              will not be held liable for any outdated documentation. These
              files help transporters trust your business and help our platform
              uphold high user standards.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-info/10 border border-info/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-info" />
            <div>
              <h4 className="font-medium text-info mb-1">
                Verified Business Documents
              </h4>
              <p className="text-sm text-base-content/70">
                This client's business documents have been verified by our
                platform team. All displayed documents are current and verified
                for your confidence.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfileFiles;
