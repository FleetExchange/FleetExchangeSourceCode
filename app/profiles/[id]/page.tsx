"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft } from "lucide-react";

import ClientProfileInfo from "@/components/ClientProfileInfo";
import ClientProfileFiles from "@/components/ClientProfileFiles";
import TransporterProfileInfo from "@/components/TransporterProfileInfo";
import TransporterProfileFiles from "@/components/TransporterProfileFiles";
import ProfileViewClient from "./ProfileViewClient";

export const dynamic = "force-dynamic"; // ensure fresh data if needed

export default function ProfilePage({ params }: { params: { id: string } }) {
  return <ProfileViewClient id={params.id} />;
}
