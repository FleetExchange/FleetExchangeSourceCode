"use client";

import React, { useState } from "react";
import { AlertTriangle, X, HelpCircle } from "lucide-react";
import HelpPage from "./HelpPage"; // Adjust import path as needed

interface BannerProps {
  message?: string;
  type?: "info" | "warning" | "error" | "success";
  dismissible?: boolean;
}

const Banner: React.FC<BannerProps> = ({
  message = "FleetExchange is still in development. If you encounter any issues or have feature requests, please submit a query.",
  type = "warning",
  dismissible = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showHelpPage, setShowHelpPage] = useState(false);

  if (!isVisible) return null;

  const getBannerStyles = () => {
    switch (type) {
      case "info":
        return "bg-info/10 border-info/20 text-info";
      case "warning":
        return "bg-warning/10 border-warning/20 text-warning";
      case "error":
        return "bg-error/10 border-error/20 text-error";
      case "success":
        return "bg-success/10 border-success/20 text-success";
      default:
        return "bg-warning/10 border-warning/20 text-warning";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "info":
        return <HelpCircle className="w-4 h-4 flex-shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 flex-shrink-0" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 flex-shrink-0" />;
      case "success":
        return <HelpCircle className="w-4 h-4 flex-shrink-0" />;
      default:
        return <AlertTriangle className="w-4 h-4 flex-shrink-0" />;
    }
  };

  return (
    <>
      <div className={`border-b ${getBannerStyles()}`}>
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3">
          {/* Mobile Layout - Stacked */}
          <div className="block sm:hidden">
            {/* Text centered with icon */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {getIcon()}
              <p className="text-xs font-medium text-base-content text-center leading-tight">
                {message}
              </p>
            </div>

            {/* Buttons centered */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setShowHelpPage(true)}
                className="btn btn-xs btn-outline gap-1 hover:bg-base-100 text-xs"
              >
                <HelpCircle className="w-3 h-3" />
                Help
              </button>

              {dismissible && (
                <button
                  onClick={() => setIsVisible(false)}
                  className="btn btn-xs btn-ghost hover:bg-base-100 p-1"
                  aria-label="Dismiss banner"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Layout - Horizontal */}
          <div className="hidden sm:flex items-center justify-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {getIcon()}
              <p className="text-sm font-medium text-base-content flex-1 leading-tight">
                {message}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Help Button */}
              <button
                onClick={() => setShowHelpPage(true)}
                className="btn btn-sm btn-outline gap-2 hover:bg-base-100 text-xs"
              >
                <HelpCircle className="w-4 h-4" />
                Submit Query
              </button>

              {/* Dismiss Button */}
              {dismissible && (
                <button
                  onClick={() => setIsVisible(false)}
                  className="btn btn-sm btn-ghost hover:bg-base-100 p-1"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Help Page Modal */}
      {showHelpPage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-base-300">
              <h2 className="text-lg sm:text-xl font-bold text-base-content">
                Submit Query or Report Issue
              </h2>
              <button
                onClick={() => setShowHelpPage(false)}
                className="btn btn-sm btn-ghost hover:bg-base-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <HelpPage onClose={() => setShowHelpPage(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Banner;
