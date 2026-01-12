import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Asset, Profile, AssetCategory } from "@/types/database";

export type AssetWithCreator = Asset & {
  creator: Pick<Profile, "display_name" | "email"> | null;
  implementer: Pick<Profile, "display_name" | "email"> | null;
};

export interface UseAssetsOptions {
  status?: "pending" | "implemented";
  category?: AssetCategory | null;
}

export function useAssets(statusOrOptions?: "pending" | "implemented" | UseAssetsOptions) {
  // Support both legacy (status string) and new (options object) API
  const options: UseAssetsOptions = typeof statusOrOptions === 'object'
    ? statusOrOptions
    : { status: statusOrOptions };

  const { status, category } = options;

  return useQuery({
    queryKey: ["assets", status, category],
    queryFn: async (): Promise<AssetWithCreator[]> => {
      let query = supabase
        .from("assets")
        .select(
          `
          *,
          creator:profiles!created_by(display_name, email),
          implementer:profiles!implemented_by(display_name, email)
        `
        )
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as AssetWithCreator[];
    },
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ["asset", id],
    queryFn: async (): Promise<AssetWithCreator | null> => {
      const { data, error } = await supabase
        .from("assets")
        .select(
          `
          *,
          creator:profiles!created_by(display_name, email),
          implementer:profiles!implemented_by(display_name, email)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as AssetWithCreator;
    },
    enabled: !!id,
  });
}
