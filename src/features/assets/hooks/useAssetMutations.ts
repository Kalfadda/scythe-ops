import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import type { AssetCategory, AssetPriority } from "@/types/database";

interface CreateAssetData {
  name: string;
  blurb: string;
  category?: AssetCategory | null;
  priority?: AssetPriority | null;
}

export function useAssetMutations() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const createAsset = useMutation({
    mutationFn: async (data: CreateAssetData) => {
      console.log("Creating asset...", data);
      if (!user) {
        console.error("No user found");
        throw new Error("Not authenticated");
      }

      console.log("User ID:", user.id);
      const { data: asset, error } = await supabase
        .from("assets")
        .insert({
          name: data.name,
          blurb: data.blurb,
          category: data.category || null,
          priority: data.priority || null,
          status: "pending",
          created_by: user.id,
        })
        .select()
        .single();

      console.log("Insert result:", { asset, error });
      if (error) {
        console.error("Insert error:", error);
        throw error;
      }
      return asset;
    },
    onSuccess: () => {
      console.log("Asset created successfully");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  const updateAsset = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      blurb?: string;
      status?: "pending" | "implemented";
    }) => {
      const { data: asset, error } = await supabase
        .from("assets")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return asset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });

  const markAsImplemented = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data: asset, error } = await supabase
        .from("assets")
        .update({
          status: "implemented",
          implemented_by: user.id,
          implemented_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return asset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });

  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("assets").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });

  return {
    createAsset,
    updateAsset,
    markAsImplemented,
    deleteAsset,
  };
}
