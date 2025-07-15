"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";

export default function SyncUserWithConvex() {
  const { user } = useUser(); //get user from clerk/nextjs
  const updateUser = useMutation(api.users.updateUser); //React query hook Mutation method to change user

  // everytime user changes or update user is called
  useEffect(() => {
    if (!user) return;

    const syncUser = async () => {
      try {
        await updateUser({
          userId: user.id,
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          email: user.emailAddresses[0]?.emailAddress ?? "",
          role:
            (user.publicMetadata?.role as "client" | "transporter") ?? "client", // Get role from user metadata
          contactNumber: (user.publicMetadata?.contactNumber as string) ?? "", // Get contact from metadata
        });
      } catch (error) {
        console.error("Error syncing user with Convex:", error);
      }
    };

    syncUser();
  }, [user, updateUser]);

  return null;
}
