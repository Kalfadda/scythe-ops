import { Bell } from "lucide-react";
import { useNotificationRealtime } from "../hooks/useNotificationRealtime";
import { NotificationList } from "./NotificationList";

export function NotificationsView() {
  // Enable real-time updates for the notifications list
  useNotificationRealtime();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: "rgba(251, 146, 60, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell style={{ width: 22, height: 22, color: "#fb923c" }} />
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#1e1e2e",
              margin: 0,
            }}
          >
            Notifications
          </h2>
        </div>
        <p
          style={{
            fontSize: 14,
            color: "#6b7280",
            margin: 0,
            marginLeft: 52,
          }}
        >
          Activity log for the team
        </p>
      </div>

      {/* Notification List with infinite scroll */}
      <NotificationList />
    </div>
  );
}
