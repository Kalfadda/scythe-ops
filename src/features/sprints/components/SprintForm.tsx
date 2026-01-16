import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Zap } from "lucide-react";
import { useSprintMutations } from "../hooks/useSprintMutations";

interface SprintFormProps {
  onClose: () => void;
}

export function SprintForm({ onClose }: SprintFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { createSprint } = useSprintMutations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createSprint.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
        }}
      />

      {/* Modal Container */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 101,
          padding: 24,
          pointerEvents: 'none',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            width: '100%',
            maxWidth: 480,
            backgroundColor: '#ffffff',
            borderRadius: 16,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e5eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Zap style={{ width: 20, height: 20, color: '#7c3aed' }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#1e1e2e',
                  margin: 0,
                }}>
                  New Sprint
                </h2>
                <p style={{
                  fontSize: 13,
                  color: '#6b7280',
                  margin: 0,
                }}>
                  Group related tasks into a focused sprint
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 8,
                border: 'none',
                backgroundColor: 'transparent',
                color: '#9ca3af',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: 20, height: 20 }} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Name */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#4b5563',
                  marginBottom: 8,
                }}>
                  Sprint Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Q1 Character System Sprint"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: 14,
                    borderRadius: 10,
                    border: '1px solid #e5e5eb',
                    backgroundColor: '#f9fafb',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#7c3aed'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e5eb'}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#4b5563',
                  marginBottom: 8,
                }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the goal of this sprint..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: 14,
                    borderRadius: 10,
                    border: '1px solid #e5e5eb',
                    backgroundColor: '#f9fafb',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'none',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#7c3aed'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e5eb'}
                />
              </div>

              {/* Info text */}
              <p style={{
                fontSize: 12,
                color: '#9ca3af',
                margin: 0,
                lineHeight: 1.5,
              }}>
                Sprints automatically complete when all their tasks reach "Implemented" status.
              </p>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e5e5eb',
              backgroundColor: '#fafafa',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#6b7280',
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5eb',
                  borderRadius: 10,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || createSprint.isPending}
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  backgroundColor: name.trim() ? '#7c3aed' : '#d1d5db',
                  border: 'none',
                  borderRadius: 10,
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {createSprint.isPending ? 'Creating...' : 'Create Sprint'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
