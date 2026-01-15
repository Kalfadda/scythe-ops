import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FileQuestion, Loader2 } from "lucide-react";
import { useFeatureRequests, type FeatureRequestWithCreator } from "../hooks/useFeatureRequests";
import { useFeatureRequestMutations } from "../hooks/useFeatureRequestMutations";
import { FeatureRequestCard } from "./FeatureRequestCard";
import { FeatureRequestDetailModal } from "./FeatureRequestDetailModal";
import type { FeatureRequestStatus } from "@/types/database";

interface FeatureRequestListProps {
  status: FeatureRequestStatus;
}

export function FeatureRequestList({ status }: FeatureRequestListProps) {
  const { data: requests, isLoading, error } = useFeatureRequests({ status });
  const { acceptRequest, denyRequest, deleteRequest } = useFeatureRequestMutations();

  const [selectedRequest, setSelectedRequest] = useState<FeatureRequestWithCreator | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCardClick = (request: FeatureRequestWithCreator) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedRequest(null), 200);
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptRequest.mutateAsync(id);
      handleCloseModal();
    } catch (err) {
      console.error("Failed to accept request:", err);
    }
  };

  const handleDeny = async (id: string, reason: string) => {
    try {
      await denyRequest.mutateAsync({ requestId: id, reason });
      handleCloseModal();
    } catch (err) {
      console.error("Failed to deny request:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    setDeletingId(id);
    try {
      await deleteRequest.mutateAsync(id);
    } catch (err) {
      console.error("Failed to delete request:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        color: '#9ca3af',
      }}>
        <Loader2
          style={{
            width: 32,
            height: 32,
            marginBottom: 16,
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ margin: 0, fontSize: 14 }}>Loading requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '32px 24px',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderRadius: 12,
        border: '1px solid rgba(239, 68, 68, 0.2)',
        color: '#ef4444',
        textAlign: 'center',
      }}>
        <p style={{ margin: 0, fontSize: 14 }}>
          Failed to load requests. Please try again.
        </p>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        color: '#9ca3af',
      }}>
        <FileQuestion style={{ width: 48, height: 48, marginBottom: 16, opacity: 0.5 }} />
        <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#6b7280' }}>
          {status === "open" ? "No open requests" : "No denied requests"}
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: 14 }}>
          {status === "open"
            ? "Create a new request to get started"
            : "Denied requests will appear here for 7 days"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}
      >
        <AnimatePresence mode="popLayout">
          {requests.map((request, index) => (
            <FeatureRequestCard
              key={request.id}
              request={request}
              index={index}
              onClick={() => handleCardClick(request)}
              onDelete={status === "open" ? handleDelete : undefined}
              isDeleting={deletingId === request.id}
            />
          ))}
        </AnimatePresence>
      </div>

      <FeatureRequestDetailModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAccept={status === "open" ? handleAccept : undefined}
        onDeny={status === "open" ? handleDeny : undefined}
        isTransitioning={acceptRequest.isPending || denyRequest.isPending}
      />
    </>
  );
}
