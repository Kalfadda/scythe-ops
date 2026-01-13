import { motion } from "motion/react";
import { Clock, User, X, Tag, Flag } from "lucide-react";
import type { AssetWithCreator } from "../hooks/useAssets";
import { getDaysUntilDelete } from "../hooks/useAssets";
import { ASSET_CATEGORIES, ASSET_PRIORITIES } from "@/types/database";

interface AssetCardProps {
  asset: AssetWithCreator;
  index: number;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

const STATUS_STYLES = {
  pending: {
    bg: 'rgba(202, 138, 4, 0.15)',
    color: '#b45309',
    label: 'Pending'
  },
  completed: {
    bg: 'rgba(59, 130, 246, 0.15)',
    color: '#2563eb',
    label: 'Completed'
  },
  implemented: {
    bg: 'rgba(22, 163, 74, 0.15)',
    color: '#16a34a',
    label: 'Implemented'
  }
};

export function AssetCard({
  asset,
  index,
  onClick,
  onDelete,
  isDeleting,
}: AssetCardProps) {
  const creatorName =
    asset.creator?.display_name || asset.creator?.email || "Unknown";
  const category = asset.category ? ASSET_CATEGORIES[asset.category] : null;
  const priority = asset.priority ? ASSET_PRIORITIES[asset.priority] : null;
  const statusStyle = STATUS_STYLES[asset.status];
  const daysLeft = asset.status === "implemented" ? getDaysUntilDelete(asset.implemented_at) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      layout
      style={{ height: '100%' }}
    >
      <div
        onClick={onClick}
        style={{
          height: '100%',
          borderRadius: 12,
          border: `1px solid ${category ? `${category.color}30` : '#e5e5eb'}`,
          backgroundColor: category ? `${category.color}06` : '#ffffff',
          padding: 20,
          transition: 'all 0.2s',
          boxSizing: 'border-box',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          cursor: onClick ? 'pointer' : 'default',
        }}
      >
        {/* Header with badges */}
        <div style={{
          marginBottom: 12,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badges row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {/* Status badge */}
              <span style={{
                borderRadius: 999,
                padding: '3px 8px',
                fontSize: 11,
                fontWeight: 500,
                backgroundColor: statusStyle.bg,
                color: statusStyle.color
              }}>
                {statusStyle.label}
              </span>

              {/* Days until auto-delete badge for implemented */}
              {daysLeft !== null && (
                <span style={{
                  borderRadius: 999,
                  padding: '3px 8px',
                  fontSize: 11,
                  fontWeight: 500,
                  backgroundColor: daysLeft <= 2 ? 'rgba(220, 38, 38, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                  color: daysLeft <= 2 ? '#dc2626' : '#6b7280'
                }}>
                  {daysLeft === 0 ? 'Deleting soon' : `${daysLeft}d left`}
                </span>
              )}

              {/* Category badge */}
              {category && (
                <span style={{
                  borderRadius: 999,
                  padding: '3px 8px',
                  fontSize: 11,
                  fontWeight: 500,
                  backgroundColor: `${category.color}18`,
                  color: category.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}>
                  <Tag style={{ width: 10, height: 10 }} />
                  {category.label}
                </span>
              )}

              {/* Priority badge */}
              {priority && (
                <span style={{
                  borderRadius: 999,
                  padding: '3px 8px',
                  fontSize: 11,
                  fontWeight: 500,
                  backgroundColor: `${priority.color}18`,
                  color: priority.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}>
                  <Flag style={{ width: 10, height: 10 }} />
                  {priority.label}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 style={{
              fontWeight: 600,
              fontSize: 17,
              color: '#1e1e2e',
              lineHeight: 1.3,
              margin: 0,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {asset.name}
            </h3>
          </div>

          {/* Delete button */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(asset.id);
              }}
              disabled={isDeleting}
              title="Delete asset"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 6,
                border: 'none',
                backgroundColor: 'transparent',
                color: '#9ca3af',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                opacity: isDeleting ? 0.5 : 1,
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>

        {/* Description preview */}
        {asset.blurb && (
          <p style={{
            marginBottom: 14,
            fontSize: 13,
            color: '#6b7280',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            marginTop: 0,
            lineHeight: 1.5,
          }}>
            {asset.blurb}
          </p>
        )}

        {/* Meta info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: '#9ca3af'
        }}>
          <User style={{ width: 13, height: 13 }} />
          <span>{creatorName}</span>
          <span style={{ margin: '0 2px' }}>·</span>
          <Clock style={{ width: 13, height: 13 }} />
          <span>{formatDate(asset.created_at)}</span>
        </div>

        {/* Click hint */}
        {onClick && (
          <div style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid #f0f0f5',
            fontSize: 12,
            color: '#9ca3af',
            textAlign: 'center',
          }}>
            Click to view details
          </div>
        )}
      </div>
    </motion.div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}
