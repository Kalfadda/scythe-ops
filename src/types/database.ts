// Asset categories for organization
export type AssetCategory =
  | "art"
  | "code"
  | "audio"
  | "design"
  | "documentation"
  | "marketing"
  | "infrastructure"
  | "other";

// Priority levels
export type AssetPriority = "low" | "medium" | "high" | "critical";

// Category metadata for UI
export const ASSET_CATEGORIES: Record<AssetCategory, { label: string; color: string }> = {
  art: { label: "Art", color: "#ec4899" },
  code: { label: "Code", color: "#3b82f6" },
  audio: { label: "Audio", color: "#8b5cf6" },
  design: { label: "Design", color: "#f59e0b" },
  documentation: { label: "Docs", color: "#6b7280" },
  marketing: { label: "Marketing", color: "#10b981" },
  infrastructure: { label: "Infra", color: "#ef4444" },
  other: { label: "Other", color: "#6b7280" },
};

// Priority metadata for UI
export const ASSET_PRIORITIES: Record<AssetPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "#6b7280" },
  medium: { label: "Medium", color: "#3b82f6" },
  high: { label: "High", color: "#f59e0b" },
  critical: { label: "Critical", color: "#ef4444" },
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          is_blocked: boolean;
          blocked_at: string | null;
          blocked_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          is_blocked?: boolean;
          blocked_at?: string | null;
          blocked_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          is_blocked?: boolean;
          blocked_at?: string | null;
          blocked_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          name: string;
          blurb: string | null;
          status: "pending" | "implemented";
          category: AssetCategory | null;
          priority: AssetPriority | null;
          created_by: string | null;
          implemented_by: string | null;
          implemented_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          blurb?: string | null;
          status?: "pending" | "implemented";
          category?: AssetCategory | null;
          priority?: AssetPriority | null;
          created_by?: string | null;
          implemented_by?: string | null;
          implemented_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          blurb?: string | null;
          status?: "pending" | "implemented";
          category?: AssetCategory | null;
          priority?: AssetPriority | null;
          created_by?: string | null;
          implemented_by?: string | null;
          implemented_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Asset = Database["public"]["Tables"]["assets"]["Row"];
export type AssetInsert = Database["public"]["Tables"]["assets"]["Insert"];
export type AssetUpdate = Database["public"]["Tables"]["assets"]["Update"];
