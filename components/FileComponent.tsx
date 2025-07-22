"use client";

import React, { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface FileComponentProps {
  userId: Id<"users">;
  category?: string;
  fileId?: string; // optional: pass to display an existing file
  editable?: boolean;
}

const FileComponent: React.FC<FileComponentProps> = ({
  userId,
  category = "general",
  fileId,
  editable = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);

  // Convex mutations
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const uploadFileMeta = useMutation(api.files.uploadFile);
  const replaceFile = useMutation(api.files.replaceFile);

  // Get file metadata if fileId is provided
  const fileMeta = useQuery(
    api.files.getFileById,
    fileId ? { fileId: fileId as Id<"files"> } : "skip"
  );

  const [fileUrl, setFileUrl] = React.useState<string | null>(null);
  const getFileUrl = useMutation(api.files.getFileUrl);

  React.useEffect(() => {
    if (fileId) {
      getFileUrl({ fileId: fileId as Id<"files"> }).then((url) => {
        setFileUrl(url);
      });
    }
  }, [fileId, getFileUrl]);

  // Upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setLocalUrl(URL.createObjectURL(file));

    // 1. Get upload URL from Convex
    const uploadUrl = await generateUploadUrl();

    // 2. Upload file to Convex storage
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await uploadRes.json();

    // 3. Save file metadata in Convex
    if (fileMeta?._id) {
      // Replace existing file
      await replaceFile({
        fileId: fileMeta._id,
        newFileId: storageId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
    } else {
      // New file
      await uploadFileMeta({
        userId,
        fileName: file.name,
        fileId: storageId,
        fileType: file.type,
        fileSize: file.size,
        category,
      });
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      {/* File preview or link */}
      {fileUrl ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          {fileMeta?.fileName || "View File"}
        </a>
      ) : localUrl ? (
        <span className="text-base-content">{selectedFile?.name}</span>
      ) : (
        <span className="text-base-content/60">No file uploaded.</span>
      )}

      {/* Upload/change button */}
      {editable && (
        <>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => inputRef.current?.click()}
          >
            {fileMeta ? "Change File" : "Upload File"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
};

export default FileComponent;
