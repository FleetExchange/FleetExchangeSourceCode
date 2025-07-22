"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useConvex } from "convex/react";
import React from "react";
import { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoCheckmark } from "react-icons/io5";
import { IoCloseOutline } from "react-icons/io5";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { usePlacesWithRestrictions } from "@/hooks/usePlacesWithRestrictions";
import ProfileImage from "@/components/ProfileImage";
import { Client } from "@clerk/nextjs/server";

interface ClientProfileProps {
  clientId: string; // The client whose profile we're viewing
}

const ClientProfileInfo: React.FC<ClientProfileProps> = ({ clientId }) => {
  // Get the client's profile data
  const client = useQuery(api.users.getUserById, {
    userId: clientId as Id<"users">,
  });

  // Get the current user based on Clerk ID
  const { user } = useUser();
  const currentUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  // Check if the current user is the client to enable editing
  const isOwner = currentUser?._id === clientId;

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    address: "",
    about: "",
  });

  const profileImageUrl = useQuery(
    api.users.getProfileImageUrl,
    client?.profileImageFileId
      ? { profileImageFileId: client.profileImageFileId }
      : "skip"
  );

  // Load edit data when client data is available
  React.useEffect(() => {
    if (client) {
      setEditData({
        address: client.address || "",
        about: client.about || "",
      });
    }
  }, [client]);

  // For AddressAutocomplete
  const [addressInput, setAddressInput] = useState("");
  const places = usePlacesWithRestrictions({
    cityName: client?.address || "",
    citiesOnly: false,
  });

  React.useEffect(() => {
    if (client && !isEditing) {
      setAddressInput(client.address || "");
      places.setValue(client.address || "");
    }
    if (isEditing) {
      setAddressInput(editData.address || "");
      places.setValue(editData.address || "");
    }
    // eslint-disable-next-line
  }, [client, isEditing, editData.address]);

  //Load the mutation to update the client profile
  const updateProfile = useMutation(api.users.updateUserProfile);
  const updateProfileImage = useMutation(api.users.updateProfileImage);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);

  const handleProfileImageUpload = async (file: File) => {
    // 1. Get upload URL from Convex
    const uploadUrl = await generateUploadUrl();

    // 2. Upload file to Convex storage
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();

    // 3. Update user profile with new file ID
    await updateProfileImage({
      userId: clientId as Id<"users">,
      profileImageFileId: storageId,
    });
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        userId: clientId as Id<"users">,
        ...editData,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    if (client) {
      setEditData({
        address: client.address || "",
        about: client.about || "",
      });
    }
    setIsEditing(false);
  };

  // If no client data is available, show loading state
  if (!client) return <div>Loading...</div>;

  return (
    <div className="bg-base-100 rounded-2xl shadow-xl p-8 mb-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Client Profile Information</h2>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Image */}
        <div>
          <ProfileImage
            fileUrl={profileImageUrl || undefined}
            size={120}
            onUpload={handleProfileImageUpload}
            editable={isOwner && isEditing}
          />
        </div>

        {/* Info Section */}
        <div className="flex-1 space-y-4">
          <div>
            <span className="font-semibold">Name:</span>
            <span className="ml-2">{client.name}</span>
          </div>
          <div>
            <span className="font-semibold">Email:</span>
            <span className="ml-2">{client.email}</span>
          </div>
          <div>
            <span className="font-semibold">Phone:</span>
            <span className="ml-2">{client.contactNumber}</span>
          </div>

          {/* Editable About */}
          <div>
            <span className="font-semibold">About:</span>
            {isEditing ? (
              <textarea
                className="textarea textarea-bordered w-full mt-1  focus:ring-0 focus:outline-none"
                value={editData.about}
                onChange={(e) =>
                  setEditData({ ...editData, about: e.target.value })
                }
              />
            ) : (
              <p className="ml-2">
                {client.about || "No description provided."}
              </p>
            )}
          </div>
          {/* Editable Address */}
          <div>
            <span className="font-semibold">Address:</span>
            {isEditing ? (
              <div className="mt-1">
                <AddressAutocomplete
                  value={addressInput}
                  onChange={(val) => {
                    setAddressInput(val);
                    setEditData({ ...editData, address: val });
                  }}
                  label="Address"
                  ready={places.ready}
                  inputValue={places.value}
                  onInputChange={places.setValue}
                  suggestions={places.suggestions}
                  status={places.status}
                  clearSuggestions={places.clearSuggestions}
                />
              </div>
            ) : (
              <span className="ml-2">
                {client.address || "No address provided."}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Edit Controls */}
      {isOwner && (
        <div className="flex gap-2 mt-8 justify-end">
          {isEditing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave}>
                <IoCheckmark className="w-4 h-4" />
                Save
              </button>
              <button className="btn btn-ghost" onClick={handleCancel}>
                <IoCloseOutline className="w-4 h-4" />
                Cancel
              </button>
            </>
          ) : (
            <button
              className="btn btn-outline"
              onClick={() => setIsEditing(true)}
            >
              <CiEdit className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientProfileInfo;
