"use client";

import EditTruckCard from "@/components/EditTruckCard";
import NewTruckCard from "@/components/NewTruckCard";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const truckId = searchParams.get("truckId");

  return (
    <>
      <div className="relative top-5">
        {action === "create" && <NewTruckCard />}
        {action === "edit" && truckId && <EditTruckCard truckId={truckId} />}
      </div>
    </>
  );
};

export default Page;
