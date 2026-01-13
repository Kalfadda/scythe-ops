import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

export function useUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Profile[];
    },
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      blocked,
      reason,
    }: {
      userId: string;
      blocked: boolean;
      reason?: string;
    }) => {
      // If blocking user, unclaim all their tasks first
      if (blocked) {
        const { error: unclaimError } = await supabase
          .from("assets")
          .update({
            claimed_by: null,
            claimed_at: null,
          })
          .eq("claimed_by", userId);

        if (unclaimError) {
          console.warn("Failed to unclaim user tasks:", unclaimError);
          // Continue with blocking even if unclaim fails
        }
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          is_blocked: blocked,
          blocked_at: blocked ? new Date().toISOString() : null,
          blocked_reason: blocked ? (reason || null) : null,
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}
