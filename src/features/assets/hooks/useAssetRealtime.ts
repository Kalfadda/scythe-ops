import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useAssetRealtime() {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("assets-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assets",
        },
        () => {
          // Invalidate and refetch all asset queries
          queryClient.invalidateQueries({ queryKey: ["assets"] });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);
}
