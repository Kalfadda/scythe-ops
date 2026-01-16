import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import type { SprintStatus } from "@/types/database";

interface CreateSprintData {
  name: string;
  description?: string;
}

interface UpdateSprintData {
  id: string;
  name?: string;
  description?: string;
  status?: SprintStatus;
}

// Helper function to check and auto-complete sprint when all tasks are implemented
export async function checkSprintAutoComplete(sprintId: string) {
  // Get all tasks in the sprint
  const { data: sprintTasks } = await supabase
    .from("sprint_tasks")
    .select("asset_id")
    .eq("sprint_id", sprintId);

  if (!sprintTasks || sprintTasks.length === 0) return;

  // Get the status of all these tasks
  const assetIds = sprintTasks.map(st => st.asset_id);
  const { data: assets } = await supabase
    .from("assets")
    .select("status")
    .in("id", assetIds);

  if (!assets) return;

  // Check if ALL tasks are implemented
  const allImplemented = assets.every(a => a.status === "implemented");

  if (allImplemented) {
    // Auto-complete the sprint
    await supabase
      .from("sprints")
      .update({
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", sprintId)
      .eq("status", "active"); // Only update if still active
  }
}

export function useSprintMutations() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const createSprint = useMutation({
    mutationFn: async (data: CreateSprintData) => {
      if (!user) throw new Error("Not authenticated");

      const { data: sprint, error } = await supabase
        .from("sprints")
        .insert({
          name: data.name,
          description: data.description || null,
          status: "active",
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return sprint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
    },
  });

  const updateSprint = useMutation({
    mutationFn: async ({ id, ...data }: UpdateSprintData) => {
      if (!user) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = { ...data };

      // Set timestamps based on status changes
      if (data.status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { data: sprint, error } = await supabase
        .from("sprints")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return sprint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      queryClient.invalidateQueries({ queryKey: ["sprint"] });
    },
  });

  const deleteSprint = useMutation({
    mutationFn: async (id: string) => {
      // Sprint_tasks and task_dependencies will cascade delete
      const { error } = await supabase
        .from("sprints")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      queryClient.invalidateQueries({ queryKey: ["sprint"] });
      queryClient.invalidateQueries({ queryKey: ["sprints_for_task"] });
    },
  });

  // Add a task to a sprint
  const addTaskToSprint = useMutation({
    mutationFn: async ({ sprintId, assetId, orderIndex }: { sprintId: string; assetId: string; orderIndex?: number }) => {
      // Get current max order_index if not provided
      let order = orderIndex;
      if (order === undefined) {
        const { data: existing } = await supabase
          .from("sprint_tasks")
          .select("order_index")
          .eq("sprint_id", sprintId)
          .order("order_index", { ascending: false })
          .limit(1);

        order = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;
      }

      const { data, error } = await supabase
        .from("sprint_tasks")
        .insert({
          sprint_id: sprintId,
          asset_id: assetId,
          order_index: order,
        })
        .select()
        .single();

      if (error) throw error;

      // Check if sprint should auto-complete
      await checkSprintAutoComplete(sprintId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sprint", variables.sprintId] });
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      queryClient.invalidateQueries({ queryKey: ["sprints_for_task", variables.assetId] });
    },
  });

  // Remove a task from a sprint
  const removeTaskFromSprint = useMutation({
    mutationFn: async ({ sprintId, assetId }: { sprintId: string; assetId: string }) => {
      const { error } = await supabase
        .from("sprint_tasks")
        .delete()
        .eq("sprint_id", sprintId)
        .eq("asset_id", assetId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sprint", variables.sprintId] });
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      queryClient.invalidateQueries({ queryKey: ["sprints_for_task", variables.assetId] });
    },
  });

  // Reorder tasks in a sprint
  const reorderSprintTasks = useMutation({
    mutationFn: async ({ sprintId, taskOrders }: { sprintId: string; taskOrders: { assetId: string; orderIndex: number }[] }) => {
      // Update each task's order_index
      for (const { assetId, orderIndex } of taskOrders) {
        const { error } = await supabase
          .from("sprint_tasks")
          .update({ order_index: orderIndex })
          .eq("sprint_id", sprintId)
          .eq("asset_id", assetId);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sprint", variables.sprintId] });
    },
  });

  return {
    createSprint,
    updateSprint,
    deleteSprint,
    addTaskToSprint,
    removeTaskFromSprint,
    reorderSprintTasks,
  };
}
