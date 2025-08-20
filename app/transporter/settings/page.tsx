"use client";

import BAManagementPage from "@/components/BAManagementPage";
import HelpPage from "@/components/HelpPage";

import { Settings, CreditCard, Bell, HelpCircle } from "lucide-react";
import React, { useState } from "react";

const TransporterSettings = () => {
  const [activeTab, setActiveTab] = useState("bank");

  const tabs = [
    {
      id: "bank",
      label: "Bank Accounts",
      icon: CreditCard,
      component: <BAManagementPage />,
    },

    {
      id: "help",
      label: "Help & Support",
      icon: HelpCircle,
      component: <HelpPage />,
    },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-4 lg:p-6">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 pl-16 lg:pl-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
                  Settings
                </h1>
                <p className="text-base-content/60 mt-2">
                  Manage your account preferences and configurations
                </p>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-base-300 p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-base-content">
                    Account Settings
                  </h2>
                  <p className="text-sm text-base-content/60">
                    Configure your transporter account
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="block lg:hidden border-b border-base-300">
              <div className="dropdown dropdown-bottom w-full">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    {React.createElement(
                      tabs.find((tab) => tab.id === activeTab)?.icon ||
                        Settings,
                      { className: "w-4 h-4" }
                    )}
                    {tabs.find((tab) => tab.id === activeTab)?.label}
                  </div>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow border border-base-300"
                >
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <li key={tab.id}>
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 w-full ${
                            activeTab === tab.id ? "active" : ""
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Desktop Tab Navigation */}
            <div className="hidden lg:block border-b border-base-300">
              <div className="flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-primary text-primary bg-primary/5"
                          : "border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 lg:p-6">
              {tabs.find((tab) => tab.id === activeTab)?.component}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransporterSettings;
