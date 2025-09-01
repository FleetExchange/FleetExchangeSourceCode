import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  CiBellOn,
  CiCircleCheck,
  CiTrash,
  CiDeliveryTruck,
  CiShoppingCart,
  CiDollar,
  CiSettings,
  CiUser,
} from "react-icons/ci";
import { VscClose } from "react-icons/vsc";
import { formatRelativeTimeInSAST } from "@/utils/dateUtils";

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  userId: Id<"users">;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  open,
  onClose,
  userId,
}) => {
  const notifications = useQuery(api.notifications.getByUser, { userId }) ?? [];
  const markAsRead = useMutation(api.notifications.markAsRead);
  const [tab, setTab] = useState<"unread" | "all">("unread");

  // Type configurations matching your schema
  const typeConfig = {
    trip: {
      icon: CiDeliveryTruck,
      label: "Trip",
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    booking: {
      icon: CiShoppingCart,
      label: "Booking",
      color: "text-info",
      bgColor: "bg-info/10",
      borderColor: "border-info/20",
    },
    payment: {
      icon: CiDollar,
      label: "Payment",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/20",
    },
    system: {
      icon: CiSettings,
      label: "System",
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20",
    },
    account: {
      icon: CiUser,
      label: "Account",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/20",
    },
    paymentRequest: {
      icon: CiDollar,
      label: "Payment Request",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/20",
    },
  };

  const unread = notifications.filter((n) => !n.read);
  const all = notifications;

  const handleMarkAllRead = async () => {
    for (const n of unread) {
      await markAsRead({ notificationId: n._id });
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div className="fixed top-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-base-100 rounded-2xl shadow-xl border border-base-300 z-50 overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-primary-content p-4 border-b border-primary-content/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CiBellOn className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-lg">Notifications</h3>
                <p className="text-primary-content/70 text-sm">
                  {unread.length} unread notification
                  {unread.length !== 1 ? "s" : ""} • SAST
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle text-primary-content hover:bg-primary-content/10"
            >
              <VscClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-base-100 border-b border-base-300 p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                className={`btn btn-sm ${
                  tab === "unread"
                    ? "btn-primary"
                    : "btn-ghost hover:bg-base-200"
                }`}
                onClick={() => setTab("unread")}
              >
                Unread ({unread.length})
              </button>
              <button
                className={`btn btn-sm ${
                  tab === "all" ? "btn-primary" : "btn-ghost hover:bg-base-200"
                }`}
                onClick={() => setTab("all")}
              >
                All ({all.length})
              </button>
            </div>

            {unread.length > 0 && (
              <button
                className="btn btn-ghost btn-sm gap-2 hover:bg-base-200"
                onClick={handleMarkAllRead}
              >
                <CiCircleCheck className="w-4 h-4" />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {(tab === "unread" ? unread : all).length === 0 ? (
            <div className="text-center py-12 px-4">
              <CiBellOn className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
              <h4 className="font-medium text-base-content/60 mb-2">
                No notifications
              </h4>
              <p className="text-sm text-base-content/50">
                {tab === "unread"
                  ? "All caught up! No new notifications."
                  : "You haven't received any notifications yet."}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {(tab === "unread" ? unread : all).map((n) => {
                const config = typeConfig[n.type] || typeConfig.system;
                const TypeIcon = config.icon;

                return (
                  <div
                    key={n._id}
                    className={`p-4 mb-2 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      n.read
                        ? "bg-base-100 border-base-300 hover:bg-base-200/50"
                        : `${config.bgColor} ${config.borderColor} hover:opacity-80`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Type Icon */}
                      <div
                        className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border flex-shrink-0`}
                      >
                        <TypeIcon className={`w-4 h-4 ${config.color}`} />
                      </div>

                      <div className="flex-grow">
                        {/* Type Label & Status */}
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-md ${config.bgColor} ${config.color}`}
                          >
                            {config.label}
                          </span>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              n.read ? "bg-base-300" : "bg-primary"
                            }`}
                          />
                          <span
                            className={`text-xs font-medium ${
                              n.read ? "text-base-content/60" : "text-primary"
                            }`}
                          >
                            {n.read ? "Read" : "New"}
                          </span>
                        </div>

                        {/* Message */}
                        <p
                          className={`text-sm leading-relaxed mb-2 ${
                            n.read
                              ? "text-base-content/80"
                              : "text-base-content"
                          }`}
                        >
                          {n.message}
                        </p>

                        {/* Simplified Timestamp using existing utility */}
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-base-content/60">
                            {formatRelativeTimeInSAST(n.createdAt)}
                          </p>
                          <div className="w-1 h-1 bg-base-content/30 rounded-full"></div>
                          <p className="text-xs text-base-content/50">SAST</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 items-end">
                        {/* If this is a payment request, show a Pay button linking to the auth URL */}
                        {n.type === "paymentRequest" &&
                          (n.meta as any)?.url && (
                            <a
                              href={(n.meta as any).url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-success gap-1"
                              onClick={() =>
                                markAsRead({ notificationId: n._id })
                              }
                            >
                              <CiDollar className="w-3 h-3" />
                              Pay now
                            </a>
                          )}

                        {/* Mark as read */}
                        {!n.read && (
                          <button
                            className="btn btn-xs btn-primary btn-outline gap-1 flex-shrink-0"
                            onClick={() =>
                              markAsRead({ notificationId: n._id })
                            }
                          >
                            <CiCircleCheck className="w-3 h-3" />
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-base-200/50 border-t border-base-300 p-4">
          <div className="flex items-center justify-center gap-2">
            <CiTrash className="w-4 h-4 text-base-content/60" />
            <p className="text-xs text-base-content/60 text-center">
              Notifications are automatically cleared after 10 days • All times
              in SAST
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;
