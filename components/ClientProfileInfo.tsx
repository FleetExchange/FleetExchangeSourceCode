"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useConvex } from "convex/react";
import React from "react";
import { useState } from "react";
import {
  Edit,
  Check,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { usePlacesWithRestrictions } from "@/hooks/usePlacesWithRestrictions";
import ProfileImage from "@/components/ProfileImage";

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
  if (!client) {
    return (
      <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-8">
        <div className="flex items-center justify-center py-8">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-base-300 p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-base-content">
              Client Profile
            </h2>
            <p className="text-sm text-base-content/60">
              {isOwner
                ? "Manage your profile information"
                : "View client details"}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center gap-3">
            <ProfileImage fileUrl={client.profileImageUrl} size={120} />
            <div className="text-center">
              <h3 className="font-semibold text-base-content">{client.name}</h3>
              <p className="text-sm text-base-content/60">Client</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="bg-base-200/50 border border-base-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-base-content/60">
                    Name
                  </span>
                </div>
                <p className="font-medium text-base-content">{client.name}</p>
              </div>

              {/* Email */}
              <div className="bg-base-200/50 border border-base-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-base-content/60">
                    Email
                  </span>
                </div>
                <p className="font-medium text-base-content break-all overflow-hidden">
                  {client.email}
                </p>
              </div>

              {/* Phone */}
              <div className="bg-base-200/50 border border-base-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-base-content/60">
                    Phone
                  </span>
                </div>
                <p className="font-medium text-base-content">
                  {client.contactNumber || "Not provided"}
                </p>
              </div>

              {/* Address */}
              <div className="bg-base-200/50 border border-base-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-base-content/60">
                    Address
                  </span>
                </div>
                {isEditing ? (
                  <div className="mt-2">
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
                  <p className="font-medium text-base-content">
                    {client.address || "Not provided"}
                  </p>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="bg-base-200/50 border border-base-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-base-content/60">
                  About
                </span>
              </div>
              {isEditing ? (
                <textarea
                  className="textarea textarea-bordered w-full focus:outline-none focus:border-primary resize-none"
                  rows={4}
                  placeholder="Tell us about yourself..."
                  value={editData.about}
                  onChange={(e) =>
                    setEditData({ ...editData, about: e.target.value })
                  }
                />
              ) : (
                <p className="text-base-content">
                  {client.about || "No description provided."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Edit Controls */}
        {isOwner && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-base-300 justify-end">
            {isEditing ? (
              <>
                <button className="btn btn-primary gap-2" onClick={handleSave}>
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
                <button className="btn btn-ghost gap-2" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary gap-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        )}

        {/* Owner Notice */}
        {isOwner && !isEditing && (
          <div className="bg-info/5 border border-info/20 rounded-xl p-4 mt-6">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-info/10 rounded border border-info/20">
                <User className="w-4 h-4 text-info" />
              </div>
              <div>
                <h4 className="font-medium text-base-content mb-1">
                  Profile Tips
                </h4>
                <p className="text-sm text-base-content/60">
                  Keep your profile information up to date to help transporters
                  provide better service and build trust with your bookings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfileInfo;
