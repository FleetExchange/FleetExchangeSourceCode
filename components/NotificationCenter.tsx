import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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

  const unread = notifications.filter((n) => !n.read);
  const all = notifications;

  const handleMarkAllRead = async () => {
    for (const n of unread) {
      await markAsRead({ notificationId: n._id });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed top-4 right-4 w-96 bg-base-100 rounded-xl shadow-lg z-50 p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Notifications</h3>
        <button onClick={onClose}>&times;</button>
      </div>
      <div className="flex gap-2 mb-4">
        <button
          className={tab === "unread" ? "btn btn-primary" : "btn"}
          onClick={() => setTab("unread")}
        >
          Unread
        </button>
        <button
          className={tab === "all" ? "btn btn-primary" : "btn"}
          onClick={() => setTab("all")}
        >
          All
        </button>
        <button className="btn btn-ghost ml-auto" onClick={handleMarkAllRead}>
          Clear All
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {(tab === "unread" ? unread : all).length === 0 ? (
          <div className="text-center text-base-content/70 py-8">
            No notifications
          </div>
        ) : (
          (tab === "unread" ? unread : all).map((n) => (
            <div
              key={n._id}
              className={`p-3 mb-2 rounded ${n.read ? "bg-base-200" : "bg-blue-50"}`}
            >
              <div className="flex justify-between items-center">
                <span>{n.message}</span>
                {!n.read && (
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => markAsRead({ notificationId: n._id })}
                  >
                    Mark as read
                  </button>
                )}
              </div>
              <div className="text-xs text-base-content/60 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-center items-center m-1 mt-2">
        <p className="font-light text-sm">
          Notifications are saved for a 10 day period!
        </p>
      </div>
    </div>
  );
};

export default NotificationCenter;
