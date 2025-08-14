// components/QuickActionsWidget.tsx
"use client";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Phone,
  Package,
  Truck,
  MessageCircle,
} from "lucide-react";

const QuickActionsWidget = () => {
  const router = useRouter();

  const quickActions = [
    {
      title: "Book a Trip",
      description: "Find and book transportation",
      icon: Package,
      color: "bg-primary/10 border-primary/20 hover:bg-primary/20",
      iconColor: "text-primary",
      onClick: () => router.push("/discover"),
    },
    {
      title: "Find Routes",
      description: "Browse available routes",
      icon: Search,
      color: "bg-info/10 border-info/20 hover:bg-info/20",
      iconColor: "text-info",
      onClick: () => router.push("/discover"),
    },
    {
      title: "Track Shipment",
      description: "Monitor delivery progress",
      icon: MapPin,
      color: "bg-success/10 border-success/20 hover:bg-success/20",
      iconColor: "text-success",
      onClick: () => router.push("/myBookings"),
    },
    {
      title: "Browse Transporters",
      description: "Find trusted transporters",
      icon: Truck,
      color: "bg-warning/10 border-warning/20 hover:bg-warning/20",
      iconColor: "text-warning",
      onClick: () => router.push("/discover"),
    },
    {
      title: "Get Support",
      description: "Contact customer service",
      icon: MessageCircle,
      color: "bg-secondary/10 border-secondary/20 hover:bg-secondary/20",
      iconColor: "text-secondary",
      onClick: () => router.push("/client/settings"),
    },
    {
      title: "Emergency Contact",
      description: "24/7 emergency assistance",
      icon: Phone,
      color: "bg-error/10 border-error/20 hover:bg-error/20",
      iconColor: "text-error",
      onClick: () => window.open("tel:+27837840895"),
    },
  ];

  return (
    <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-base-content">Quick Actions</h3>
          <p className="text-sm text-base-content/60">
            Common tasks at your fingertips
          </p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;

          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`${action.color} border rounded-xl p-4 transition-all duration-200 hover:shadow-md group text-left`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-base-100 rounded-lg border border-base-300 group-hover:scale-110 transition-transform">
                  <Icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base-content mb-1">
                    {action.title}
                  </h4>
                  <p className="text-xs text-base-content/70 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsWidget;
