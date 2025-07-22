"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoCheckmark } from "react-icons/io5";
import { IoCloseOutline } from "react-icons/io5";

interface TransporterProfileProps {
  transporterId: string; // The transporter whose profile we're viewing
}

const TransporterProfileInfo: React.FC<TransporterProfileProps> = ({
  transporterId,
}) => {
  // Get the transporter's profile data
  const transporter = useQuery(api.users.getUserById, {
    userId: transporterId as Id<"users">,
  });

  // Get the current user based on Clerk ID
  const { user } = useUser();
  const currentUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  // Check if the current user is the transporter to enable editing
  const isOwner = currentUser?._id === transporterId;

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    address: "",
    about: "",
    profileImage: "",
  });

  // Load edit data when transporter data is available
  React.useEffect(() => {
    if (transporter) {
      setEditData({
        address: transporter.address || "",
        profileImage: transporter.profileImage || "",
        about: transporter.about || "",
      });
    }
  }, [transporter]);

  //Load the mutation to update the transporter profile
  const updateProfile = useMutation(api.users.updateTransporterProfile);

  const handleSave = async () => {
    try {
      await updateProfile({
        userId: transporterId as Id<"users">,
        ...editData,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    if (transporter) {
      setEditData({
        address: transporter.address || "",
        profileImage: transporter.profileImage || "",
        about: transporter.about || "",
      });
    }
    setIsEditing(false);
  };

  // If no transporter data is available, show loading state
  if (!transporter) return <div>Loading...</div>;

  return (
    <div className="bg-base-100 rounded-2xl shadow-xl p-8 mb-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        Transporter Profile Information
      </h2>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Image */}
        <div>
          {isEditing ? (
            <div className="flex flex-col items-center gap-2">
              {editData.profileImage ? (
                <img
                  src={editData.profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-base-300 flex items-center justify-center text-3xl">
                  {transporter.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <input
                type="text"
                className="input input-bordered w-full mt-2"
                placeholder="Profile Image URL"
                value={editData.profileImage}
                onChange={(e) =>
                  setEditData({ ...editData, profileImage: e.target.value })
                }
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {transporter.profileImage ? (
                <img
                  src={transporter.profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-base-300 flex items-center justify-center text-3xl">
                  {transporter.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 space-y-4">
          <div>
            <span className="font-semibold">Name:</span>
            <span className="ml-2">{transporter.name}</span>
          </div>
          <div>
            <span className="font-semibold">Email:</span>
            <span className="ml-2">{transporter.email}</span>
          </div>
          <div>
            <span className="font-semibold">Phone:</span>
            <span className="ml-2">{transporter.contactNumber}</span>
          </div>
          <div>
            <span className="font-semibold">Rating:</span>
            <span className="ml-2">
              {transporter.averageRating?.toFixed(1) ?? "No ratings"}{" "}
              <span className="text-base-content/60">
                ({transporter.ratingCount || 0} reviews)
              </span>
            </span>
          </div>
          {/* Editable About */}
          <div>
            <span className="font-semibold">About:</span>
            {isEditing ? (
              <textarea
                className="textarea textarea-bordered w-full mt-1"
                value={editData.about}
                onChange={(e) =>
                  setEditData({ ...editData, about: e.target.value })
                }
              />
            ) : (
              <p className="ml-2">
                {transporter.about || "No description provided."}
              </p>
            )}
          </div>
          {/* Editable Address */}
          <div>
            <span className="font-semibold">Address:</span>
            {isEditing ? (
              <input
                type="text"
                className="input input-bordered w-full mt-1"
                value={editData.address}
                onChange={(e) =>
                  setEditData({ ...editData, address: e.target.value })
                }
              />
            ) : (
              <span className="ml-2">
                {transporter.address || "No address provided."}
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

export default TransporterProfileInfo;
