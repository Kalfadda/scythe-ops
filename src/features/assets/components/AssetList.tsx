import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAssets, type AssetWithCreator } from "../hooks/useAssets";
import { useAssetMutations } from "../hooks/useAssetMutations";
import { AssetCard } from "./AssetCard";
import { AssetDetailModal } from "./AssetDetailModal";
import { Package, Loader2 } from "lucide-react";
import type { AssetCategory } from "@/types/database";

interface AssetListProps {
  status?: "pending" | "implemented";
  category?: AssetCategory | null;
}

export function AssetList({ status, category }: AssetListProps) {
  const { data: assets, isLoading, error } = useAssets({ status, category });
  const { markAsImplemented, deleteAsset } = useAssetMutations();
  const [selectedAsset, setSelectedAsset] = useState<AssetWithCreator | null>(null);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 0'
      }}>
        <Loader2 style={{
          width: 32,
          height: 32,
          color: '#7c3aed',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        borderRadius: 12,
        backgroundColor: 'rgba(220, 38, 38, 0.08)',
        border: '1px solid rgba(220, 38, 38, 0.2)',
        padding: 24,
        textAlign: 'center',
        color: '#dc2626'
      }}>
        Failed to load assets. Please try again.
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 0',
          textAlign: 'center'
        }}
      >
        <div style={{
          marginBottom: 16,
          display: 'flex',
          width: 80,
          height: 80,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: '#e8e8ed'
        }}>
          <Package style={{ width: 40, height: 40, color: '#9ca3af' }} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 500, color: '#1e1e2e', marginBottom: 8, marginTop: 0 }}>
          No tasks found
        </h3>
        <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 320, margin: 0 }}>
          {status === "pending"
            ? "No pending tasks. Create a new task to get started!"
            : status === "implemented"
            ? "No completed tasks yet."
            : "No tasks have been created yet."}
        </p>
      </motion.div>
    );
  }

  const handleMarkImplemented = (id: string) => {
    markAsImplemented.mutate(id, {
      onSuccess: () => {
        setSelectedAsset(null);
      }
    });
  };

  return (
    <>
      <div style={{
        display: 'grid',
        gap: 20,
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
      }}>
        <AnimatePresence mode="popLayout">
          {assets.map((asset, index) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              index={index}
              onClick={() => setSelectedAsset(asset)}
              onDelete={(id) => deleteAsset.mutate(id)}
              isDeleting={deleteAsset.isPending}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onMarkImplemented={status === "pending" ? handleMarkImplemented : undefined}
        isMarkingImplemented={markAsImplemented.isPending}
      />
    </>
  );
}
