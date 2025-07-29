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
  return (
    <button
      className="relative p-2 rounded-full hover:bg-base-200 transition-colors"
      onClick={onClick}
    >
      {/* Bell Icon */}
      <CiBellOn />

      {/* Badge showing unread count */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
