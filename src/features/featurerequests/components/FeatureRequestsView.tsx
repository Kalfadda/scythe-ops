import { useState } from "react";
import { FileQuestion, XCircle } from "lucide-react";
import { useFeatureRequests } from "../hooks/useFeatureRequests";
import { useFeatureRequestRealtime } from "../hooks/useFeatureRequestRealtime";
import { FeatureRequestList } from "./FeatureRequestList";
import { FeatureRequestForm } from "./FeatureRequestForm";
import type { FeatureRequestStatus } from "@/types/database";

type RequestTab = "open" | "denied";

export function FeatureRequestsView() {
  const [activeTab, setActiveTab] = useState<RequestTab>("open");

  // Enable real-time updates
  useFeatureRequestRealtime();

  // Get counts for tabs
  const { data: openRequests } = useFeatureRequests({ status: "open" });
  const { data: deniedRequests } = useFeatureRequests({ status: "denied" });

  const tabs: { id: RequestTab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: "open",
      label: "Open",
      icon: <FileQuestion style={{ width: 16, height: 16 }} />,
      count: openRequests?.length,
    },
    {
      id: "denied",
      label: "Denied",
      icon: <XCircle style={{ width: 16, height: 16 }} />,
      count: deniedRequests?.length,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        <div>
          <h2 style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#1e1e2e',
            marginBottom: 6,
            margin: 0,
          }}>
            Feature Requests
          </h2>
          <p style={{
            fontSize: 14,
            color: '#6b7280',
            margin: 0,
          }}>
            Request new features from the development team
          </p>
        </div>

        <FeatureRequestForm />
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid #e5e5eb',
        paddingBottom: 0,
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? '#06b6d4' : '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #06b6d4' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginBottom: -1,
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#4b5563';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: isActive ? 'rgba(6, 182, 212, 0.15)' : '#f0f0f5',
                  color: isActive ? '#06b6d4' : '#6b7280',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <FeatureRequestList status={activeTab as FeatureRequestStatus} />
    </div>
  );
}
