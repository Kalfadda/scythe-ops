import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Sprint, SprintStatus, Profile, Asset } from "@/types/database";

export type SprintWithCreator = Sprint & {
  creator: Pick<Profile, "display_name" | "email"> | null;
};

export type SprintWithDetails = SprintWithCreator & {
  tasks: (Asset & {
    creator: Pick<Profile, "display_name" | "email"> | null;
  })[];
  task_count: number;
  implemented_task_count: number;
};

export interface UseSprintsOptions {
  status?: SprintStatus;
}

export function useSprints(options?: UseSprintsOptions) {
  const { status } = options || {};

  return useQuery({
    queryKey: ["sprints", status],
    queryFn: async (): Promise<SprintWithCreator[]> => {
      let query = supabase
        .from("sprints")
        .select(`
          *,
          creator:profiles!created_by(display_name, email)
        `)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SprintWithCreator[];
    },
  });
}

export function useSprint(id: string | undefined) {
  return useQuery({
    queryKey: ["sprint", id],
    queryFn: async (): Promise<SprintWithDetails | null> => {
      if (!id) return null;

      // Get the sprint with creator
      const { data: sprint, error: sprintError } = await supabase
        .from("sprints")
        .select(`
          *,
          creator:profiles!created_by(display_name, email)
        `)
        .eq("id", id)
        .single();

      if (sprintError) throw sprintError;

      // Get sprint tasks with their assets
      const { data: sprintTasks, error: tasksError } = await supabase
        .from("sprint_tasks")
        .select(`
          asset_id,
          order_index,
          notes
        `)
        .eq("sprint_id", id)
        .order("order_index", { ascending: true });

      if (tasksError) throw tasksError;

      // Get the actual assets
      const assetIds = (sprintTasks || []).map(pt => pt.asset_id);
      let tasks: (Asset & { creator: Pick<Profile, "display_name" | "email"> | null })[] = [];

      if (assetIds.length > 0) {
        const { data: assets, error: assetsError } = await supabase
          .from("assets")
          .select(`
            *,
            creator:profiles!created_by(display_name, email)
          `)
          .in("id", assetIds);

        if (assetsError) throw assetsError;

        // Sort assets by order_index from sprint_tasks
        const orderMap = new Map(sprintTasks?.map(pt => [pt.asset_id, pt.order_index]));
        tasks = ((assets || []) as (Asset & { creator: Pick<Profile, "display_name" | "email"> | null })[])
          .sort((a, b) => (orderMap.get(a.id) || 0) - (orderMap.get(b.id) || 0));
      }

      // Count only implemented tasks for sprint completion
      const implementedCount = tasks.filter(t => t.status === "implemented").length;

      return {
        ...(sprint as SprintWithCreator),
        tasks,
        task_count: tasks.length,
        implemented_task_count: implementedCount,
      };
    },
    enabled: !!id,
  });
}

// Get sprints that a specific task belongs to
export function useSprintsForTask(assetId: string | undefined) {
  return useQuery({
    queryKey: ["sprints_for_task", assetId],
    queryFn: async (): Promise<Sprint[]> => {
      if (!assetId) return [];

      const { data: sprintTasks, error: ptError } = await supabase
        .from("sprint_tasks")
        .select("sprint_id")
        .eq("asset_id", assetId);

      if (ptError) throw ptError;

      const sprintIds = (sprintTasks || []).map(pt => pt.sprint_id);
      if (sprintIds.length === 0) return [];

      const { data: sprints, error } = await supabase
        .from("sprints")
        .select("*")
        .in("id", sprintIds);

      if (error) throw error;
      return (sprints || []) as Sprint[];
    },
    enabled: !!assetId,
  });
}
