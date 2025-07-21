"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import { useState } from "react";

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
    <div>
      <h1>Transporter Profile Information</h1>
      <div>Profile Image</div>
      <div>Name</div>
      <div>Email</div>
      <div>Number</div>
      <div>Rating</div>
      <div>Number of Ratings</div>
      <div>About Section</div>
      <div>Address</div>
    </div>
  );
};

export default TransporterProfileInfo;
