"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function RealtimeRefresh({ eventId }: { eventId: string }) {
  const router = useRouter();

  useEffect(() => {
    const client = createBrowserSupabaseClient();

    if (!client) {
      return;
    }

    const channel = client
      .channel(`event-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scores",
          filter: `event_id=eq.${eventId}`,
        },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "proxy_entries",
          filter: `event_id=eq.${eventId}`,
        },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [eventId, router]);

  return null;
}
