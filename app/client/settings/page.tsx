"use client";

import HelpPage from "@/components/HelpPage";
import React from "react";

const ClientSettings = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="w-full max-w-2xl mx-auto">
        <div className="tabs tabs-lift">
          <input
            type="radio"
            name="my_tabs_3"
            className="tab"
            aria-label="Notification Center"
          />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            Tab content 2
          </div>

          <input
            type="radio"
            name="my_tabs_3"
            className="tab"
            aria-label="Help & Support"
          />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            <HelpPage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSettings;
