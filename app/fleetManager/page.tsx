"use client";

import FleetManagerTable from "@/components/FleetManagerTable";

const page = () => {
  return (
    <>
      <div className="flex flex-col justify-start w-full fixed top-[50px]">
        <FleetManagerTable></FleetManagerTable>
      </div>
    </>
  );
};

export default page;
