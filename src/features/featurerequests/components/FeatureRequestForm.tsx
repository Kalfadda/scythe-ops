import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useFeatureRequestMutations } from "../hooks/useFeatureRequestMutations";
import { Plus, Loader2, X, Check, Flag, ChevronDown } from "lucide-react";
import { ASSET_PRIORITIES, type AssetPriority } from "@/types/database";

interface FeatureRequestFormProps {
  onSuccess?: () => void;
}

export function FeatureRequestForm({ onSuccess }: FeatureRequestFormProps) {
  const { createRequest } = useFeatureRequestMutations();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<AssetPriority | "">("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await createRequest.mutateAsync({
        name,
        description: description || undefined,
        priority: priority || null,
      });
      setName("");
      setDescription("");
      setPriority("");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
      }, 1500);
      onSuccess?.();
    } catch (err: unknown) {
      console.error("Failed to create request:", err);
      const message = err instanceof Error ? err.message : "Failed to create request";
      setError(message);
    }
  }

  function handleCancel() {
    setName("");
    setDescription("");
    setPriority("");
    setError(null);
    setIsOpen(false);
  }

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    fontSize: 16,
    fontWeight: 600,
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#06b6d4',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(6, 182, 212, 0.25)',
    transition: 'background-color 0.2s'
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={() => setIsOpen(true)}
              style={buttonStyle}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0891b2'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#06b6d4'}
            >
              <Plus style={{ marginRight: 8, width: 20, height: 20 }} />
              New Request
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{
              width: '100%',
              maxWidth: 500,
              borderRadius: 12,
              border: '1px solid #e5e5eb',
              backgroundColor: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e5e5eb',
                padding: '20px 28px'
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e1e2e', margin: 0 }}>
                  New Feature Request
                </h3>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: 6,
                    borderRadius: 8,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: '24px 28px 28px' }}>
                <AnimatePresence mode="wait">
                  {showSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '32px 0'
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        style={{
                          marginBottom: 16,
                          display: 'flex',
                          width: 64,
                          height: 64,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(22, 163, 74, 0.15)'
                        }}
                      >
                        <Check style={{ width: 32, height: 32, color: '#16a34a' }} />
                      </motion.div>
                      <p style={{ fontWeight: 500, color: '#1e1e2e', margin: 0 }}>Request submitted!</p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handleSubmit}
                    >
                      <div style={{ marginBottom: 20 }}>
                        <label htmlFor="name" style={{
                          display: 'block',
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#4b5563',
                          marginBottom: 10
                        }}>
                          Feature Name
                        </label>
                        <input
                          id="name"
                          placeholder="e.g., Dark mode support"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          autoFocus
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: 8,
                            border: '1px solid #e5e5eb',
                            backgroundColor: '#f9fafb',
                            color: '#1e1e2e',
                            fontSize: 14,
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label htmlFor="description" style={{
                          display: 'block',
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#4b5563',
                          marginBottom: 10
                        }}>
                          Description
                        </label>
                        <textarea
                          id="description"
                          placeholder="Describe the feature you need. Include use cases and any technical requirements."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={5}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: 8,
                            border: '1px solid #e5e5eb',
                            backgroundColor: '#f9fafb',
                            color: '#1e1e2e',
                            fontSize: 14,
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            minHeight: 100
                          }}
                        />
                      </div>

                      {/* Priority Select */}
                      <div style={{ marginBottom: 20 }}>
                        <label htmlFor="priority" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#4b5563',
                          marginBottom: 10
                        }}>
                          <Flag style={{ width: 14, height: 14 }} />
                          Priority
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select
                            id="priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as AssetPriority | "")}
                            style={{
                              width: '100%',
                              padding: '12px 36px 12px 14px',
                              borderRadius: 8,
                              border: '1px solid #e5e5eb',
                              backgroundColor: '#f9fafb',
                              color: priority ? '#1e1e2e' : '#9ca3af',
                              fontSize: 14,
                              outline: 'none',
                              appearance: 'none',
                              cursor: 'pointer',
                              boxSizing: 'border-box'
                            }}
                          >
                            <option value="">Select priority...</option>
                            {Object.entries(ASSET_PRIORITIES).map(([key, val]) => (
                              <option key={key} value={key}>{val.label}</option>
                            ))}
                          </select>
                          <ChevronDown style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 16,
                            height: 16,
                            color: '#9ca3af',
                            pointerEvents: 'none'
                          }} />
                        </div>
                      </div>

                      {error && (
                        <div style={{
                          padding: '12px 14px',
                          borderRadius: 8,
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          fontSize: 14,
                          marginBottom: 20
                        }}>
                          {error}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 14, paddingTop: 12 }}>
                        <button
                          type="button"
                          onClick={handleCancel}
                          style={{
                            flex: 1,
                            padding: '12px 18px',
                            borderRadius: 8,
                            border: '1px solid #e5e5eb',
                            backgroundColor: 'transparent',
                            color: '#6b7280',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={createRequest.isPending || !name.trim()}
                          style={{
                            flex: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '12px 18px',
                            borderRadius: 8,
                            border: 'none',
                            backgroundColor: createRequest.isPending || !name.trim() ? '#67e8f9' : '#06b6d4',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: createRequest.isPending || !name.trim() ? 'not-allowed' : 'pointer',
                            opacity: createRequest.isPending || !name.trim() ? 0.7 : 1
                          }}
                        >
                          {createRequest.isPending ? (
                            <Loader2 style={{ marginRight: 8, width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <Plus style={{ marginRight: 8, width: 16, height: 16 }} />
                          )}
                          Submit Request
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
