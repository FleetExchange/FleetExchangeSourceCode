import React from "react";
import { CiBellOn } from "react-icons/ci";

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  unreadCount,
  onClick,
}) => {
  const baseStyles =
    "hover:bg-base-200 text-base-content relative p-3 rounded-lg transition-all duration-200 flex items-center justify-center";

  return (
    <button
      className={`${baseStyles}`}
      onClick={onClick}
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
    >
      {/* Bell Icon */}
      <CiBellOn className="w-6 h-6 flex-shrink-0" />

      {/* Badge showing unread count */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-error text-error-content text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center shadow-lg border-2 border-base-100">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
