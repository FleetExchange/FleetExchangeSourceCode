"use client";

import FleetManagerTable from "@/components/FleetManagerTable";

const page = () => {
  return (
    <>
      <div className="flex flex-col mx-auto w-full fixed top-[50px] p-6">
        <FleetManagerTable></FleetManagerTable>
      </div>
    </>
  );
};

export default page;
