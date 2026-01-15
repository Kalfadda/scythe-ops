import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import type { AssetCategory, AssetPriority, AssetStatus } from "@/types/database";

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
      status?: AssetStatus;
      category?: AssetCategory | null;
      priority?: AssetPriority | null;
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

  // Move task to completed status
  const markAsCompleted = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data: asset, error } = await supabase
        .from("assets")
        .update({
          status: "completed",
          completed_by: user.id,
          completed_at: new Date().toISOString(),
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

  // Move task to implemented status (from completed)
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

  // Move task back to pending (from completed or implemented)
  const moveToPending = useMutation({
    mutationFn: async (id: string) => {
      const { data: asset, error } = await supabase
        .from("assets")
        .update({
          status: "pending",
          completed_by: null,
          completed_at: null,
          implemented_by: null,
          implemented_at: null,
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

  // Move task back to completed (from implemented)
  const moveToCompleted = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data: asset, error } = await supabase
        .from("assets")
        .update({
          status: "completed",
          implemented_by: null,
          implemented_at: null,
          // Keep completed_by and completed_at if they exist
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
      // First, delete any events linked to this asset
      const { error: eventError } = await supabase
        .from("events")
        .delete()
        .eq("linked_asset_id", id);

      if (eventError) {
        console.warn("Failed to delete linked events:", eventError);
      }

      // Clear linked_asset_id from model_requests that reference this asset
      const { error: modelRequestError } = await supabase
        .from("model_requests")
        .update({ linked_asset_id: null })
        .eq("linked_asset_id", id);

      if (modelRequestError) {
        console.warn("Failed to unlink model requests:", modelRequestError);
      }

      // Clear linked_asset_id from feature_requests that reference this asset
      const { error: featureRequestError } = await supabase
        .from("feature_requests")
        .update({ linked_asset_id: null })
        .eq("linked_asset_id", id);

      if (featureRequestError) {
        console.warn("Failed to unlink feature requests:", featureRequestError);
      }

      // Then delete the asset
      const { error } = await supabase.from("assets").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["model_requests"] });
      queryClient.invalidateQueries({ queryKey: ["feature_requests"] });
    },
  });

  // Claim a task
  const claimAsset = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data: asset, error } = await supabase
        .from("assets")
        .update({
          claimed_by: user.id,
          claimed_at: new Date().toISOString(),
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

  // Unclaim a task
  const unclaimAsset = useMutation({
    mutationFn: async (id: string) => {
      const { data: asset, error } = await supabase
        .from("assets")
        .update({
          claimed_by: null,
          claimed_at: null,
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

  return {
    createAsset,
    updateAsset,
    markAsCompleted,
    markAsImplemented,
    moveToPending,
    moveToCompleted,
    deleteAsset,
    claimAsset,
    unclaimAsset,
  };
}
