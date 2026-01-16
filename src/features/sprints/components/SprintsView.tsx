import { useState } from "react";
import { Zap, CheckCircle2, Plus, Loader2 } from "lucide-react";
import { useSprints, useSprint } from "../hooks/useSprints";
import { SprintCard } from "./SprintCard";
import { SprintDetailModal } from "./SprintDetailModal";
import { SprintForm } from "./SprintForm";
import type { SprintStatus, Sprint } from "@/types/database";

type SprintTab = "active" | "completed";

export function SprintsView() {
  const [activeTab, setActiveTab] = useState<SprintTab>("active");
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Get sprints by status
  const { data: activeSprints, isLoading: loadingActive } = useSprints({ status: "active" });
  const { data: completedSprints } = useSprints({ status: "completed" });

  // Get selected sprint details
  const { data: selectedSprint } = useSprint(selectedSprintId || undefined);

  const tabs: { id: SprintTab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: "active",
      label: "Active",
      icon: <Zap style={{ width: 16, height: 16 }} />,
      count: activeSprints?.length,
    },
    {
      id: "completed",
      label: "Completed",
      icon: <CheckCircle2 style={{ width: 16, height: 16 }} />,
      count: completedSprints?.length,
    },
  ];

  const getCurrentSprints = () => {
    switch (activeTab) {
      case "active":
        return activeSprints || [];
      case "completed":
        return completedSprints || [];
      default:
        return [];
    }
  };

  const sprints = getCurrentSprints();

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
            Sprints
          </h2>
          <p style={{
            fontSize: 14,
            color: '#6b7280',
            margin: 0,
          }}>
            Group tasks across departments into focused sprints
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            backgroundColor: '#7c3aed',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#6d28d9';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#7c3aed';
          }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          New Sprint
        </button>
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
                color: isActive ? '#7c3aed' : '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #7c3aed' : '2px solid transparent',
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
              {tab.count !== undefined && (
                <span style={{
                  padding: '2px 8px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: isActive ? '#7c3aed' : '#9ca3af',
                  backgroundColor: isActive ? 'rgba(124, 58, 237, 0.1)' : '#f3f4f6',
                  borderRadius: 999,
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loadingActive && activeTab === "active" ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 48,
          color: '#9ca3af',
        }}>
          <Loader2 style={{ width: 24, height: 24, animation: 'spin 1s linear infinite' }} />
        </div>
      ) : sprints.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 48,
          color: '#9ca3af',
        }}>
          <Zap style={{ width: 48, height: 48, marginBottom: 16, opacity: 0.5 }} />
          <p style={{ fontSize: 16, margin: 0 }}>
            {activeTab === "active"
              ? "No active sprints. Create one to get started."
              : "No completed sprints yet."}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 16,
        }}>
          {sprints.map((sprint) => (
            <SprintCardWrapper
              key={sprint.id}
              sprint={sprint}
              onClick={() => setSelectedSprintId(sprint.id)}
            />
          ))}
        </div>
      )}

      {/* Sprint Detail Modal */}
      <SprintDetailModal
        sprint={selectedSprint || null}
        isOpen={!!selectedSprintId}
        onClose={() => setSelectedSprintId(null)}
      />

      {/* Create Sprint Form Modal */}
      {showForm && (
        <SprintForm
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

// Wrapper to fetch task counts for each sprint
function SprintCardWrapper({
  sprint,
  onClick,
}: {
  sprint: Sprint & { creator: { display_name: string | null; email: string } | null };
  onClick: () => void;
}) {
  const { data: details } = useSprint(sprint.id);

  return (
    <SprintCard
      sprint={sprint}
      taskCount={details?.task_count || 0}
      implementedCount={details?.implemented_task_count || 0}
      onClick={onClick}
    />
  );
}
