import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import {
  useNotificationStore,
  createNotificationConfig,
} from "@/stores/notificationStore";

export function useCommentRealtime() {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const user = useAuthStore((state) => state.user);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    const channel = supabase
      .channel("comments-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
        },
        async (payload) => {
          const newRecord = payload.new as Record<string, unknown>;
          const assetId = newRecord.asset_id as string;

          // Invalidate comments for this specific asset
          queryClient.invalidateQueries({ queryKey: ["comments", assetId] });

          // Skip notifications if no user is logged in
          if (!user) return;

          const actorId = newRecord.created_by as string;

          // Skip if this was the current user's action
          if (!actorId || actorId === user.id) return;

          // Fetch actor's profile for display name
          const { data: actorProfile } = await supabase
            .from("profiles")
            .select("display_name, email")
            .eq("id", actorId)
            .single();

          // Fetch the asset name for the notification
          const { data: asset } = await supabase
            .from("assets")
            .select("name")
            .eq("id", assetId)
            .single();

          const actorName =
            actorProfile?.display_name ||
            actorProfile?.email?.split("@")[0] ||
            "Someone";

          const itemName = asset?.name || "a task";

          addNotification(
            createNotificationConfig("comment_created", itemName, actorName, false)
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient, user, addNotification]);
}
